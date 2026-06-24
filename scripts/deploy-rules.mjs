import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseEnv(path) {
  const text = readFileSync(path, "utf-8");
  const env = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = parseEnv(resolve(__dirname, "..", ".env"));

const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY;
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;

if (!projectId || !privateKey || !clientEmail) {
  console.error("Missing FIREBASE_ADMIN_* env vars");
  process.exit(1);
}

async function main() {
  const auth = new GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: projectId,
      private_key: privateKey.replace(/\\n/g, "\n"),
      client_email: clientEmail,
    },
    scopes: ["https://www.googleapis.com/auth/cloud-platform", "https://www.googleapis.com/auth/firebase"],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const token = accessToken.token;

  const rulesContent = readFileSync(resolve(__dirname, "..", "firestore.rules"), "utf-8");

  // Create or update ruleset
  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: {
          files: [
            {
              name: "firestore.rules",
              content: rulesContent,
            },
          ],
        },
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create ruleset: ${createRes.status} ${err}`);
  }

  const { name: rulesetName } = await createRes.json();
  console.log(`Created ruleset: ${rulesetName}`);

  // Release the ruleset
  const releaseName = `projects/${projectId}/releases/cloud.firestore`;
  // Try to get existing release
  const getRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const releaseName = `projects/${projectId}/releases/cloud.firestore`;

  if (getRes.ok) {
    // Release exists, update it
    const updateRes = await fetch(
      `https://firebaserules.googleapis.com/v1/${releaseName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: releaseName,
          rulesetName,
        }),
      }
    );
    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error(`Failed to update release: ${updateRes.status} ${err}`);
    }
    console.log("Firestore rules updated successfully!");
  } else if (getRes.status === 404) {
    // Release doesn't exist, create it
    const postRes = await fetch(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: releaseName,
          rulesetName,
        }),
      }
    );
    if (!postRes.ok) {
      const err = await postRes.text();
      throw new Error(`Failed to create release: ${postRes.status} ${err}`);
    }
    console.log("Firestore rules deployed successfully!");
  } else {
    const err = await getRes.text();
    throw new Error(`Failed to check release: ${getRes.status} ${err}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
