export const COUNTRIES = ["Australia"] as const;

interface SuburbEntry {
  label: string;
  suburbs: string[];
}

interface StateEntry {
  label: string;
  cities: SuburbEntry[];
}

type AddressConfig = Record<string, StateEntry[]>;

export const ADDRESS_CONFIG: AddressConfig = {
  Australia: [
    {
      label: "New South Wales",
      cities: [
        {
          label: "Sydney",
          suburbs: [
            "Surry Hills", "Bondi", "Parramatta", "Newtown", "Manly",
            "Chatswood", "Hornsby", "Penrith", "Liverpool", "Campbelltown",
            "Cronulla", "Randwick", "Paddington", "Mosman", "North Sydney",
            "Redfern", "Burwood", "Strathfield", "Other",
          ],
        },
        {
          label: "Newcastle",
          suburbs: [
            "Merewether", "Charlestown", "Hamilton", "Mayfield", "Wallsend",
            "Broadmeadow", "New Lambton", "Waratah", "Carrington", "Stockton",
            "Other",
          ],
        },
        {
          label: "Wollongong",
          suburbs: [
            "Gwynneville", "Fairy Meadow", "Figtree", "Corrimal", "Dapto",
            "Unanderra", "Port Kembla", "Thirroul", "Other",
          ],
        },
        {
          label: "Central Coast",
          suburbs: [
            "Erina", "Gosford", "Terrigal", "Tuggerah", "Ourimbah",
            "Woy Woy", "Umina", "Avoca Beach", "Other",
          ],
        },
        {
          label: "Wagga Wagga",
          suburbs: [
            "Ashmont", "Turvey Park", "Kooringal", "Estella", "Lake Albert",
            "Bourkelands", "Kapooka", "Other",
          ],
        },
        {
          label: "Albury",
          suburbs: [
            "Lavington", "Thurgoona", "North Albury", "East Albury",
            "South Albury", "West Albury", "Other",
          ],
        },
        {
          label: "Dubbo",
          suburbs: [
            "East Dubbo", "South Dubbo", "West Dubbo", "Dubbo CBD", "Other",
          ],
        },
        {
          label: "Orange",
          suburbs: [
            "West Orange", "East Orange", "South Orange", "North Orange",
            "Orange CBD", "Other",
          ],
        },
        {
          label: "Bathurst",
          suburbs: [
            "West Bathurst", "Kelso", "Eglinton", "Bathurst CBD", "Other",
          ],
        },
        { label: "Other", suburbs: ["Other"] },
      ],
    },
    {
      label: "Victoria",
      cities: [
        {
          label: "Melbourne",
          suburbs: [
            "Fitzroy", "Richmond", "South Yarra", "Carlton", "St Kilda",
            "Brunswick", "Prahran", "Collingwood", "Footscray", "Preston",
            "Dandenong", "Frankston", "Glen Waverley", "Doncaster", "Box Hill",
            "Camberwell", "Kew", "Brighton", "Hawthorn", "Malvern",
            "Other",
          ],
        },
        {
          label: "Geelong",
          suburbs: [
            "Waurn Ponds", "Grovedale", "Newtown", "Highton", "Belmont",
            "Lara", "Ocean Grove", "Torquay", "Other",
          ],
        },
        {
          label: "Ballarat",
          suburbs: [
            "Wendouree", "Sebastopol", "Alfredton", "Mount Clear", "Buninyong",
            "Lake Wendouree", "Other",
          ],
        },
        {
          label: "Bendigo",
          suburbs: [
            "Epsom", "Kangaroo Flat", "Strathdale", "Golden Square",
            "North Bendigo", "California Gully", "Other",
          ],
        },
        {
          label: "Shepparton",
          suburbs: [
            "Shepparton South", "Mooroopna", "Kialla",
            "Shepparton East", "Grahamvale", "Other",
          ],
        },
        {
          label: "Mildura",
          suburbs: [
            "Mildura South", "Irymple", "Nichols Point", "Merbein", "Other",
          ],
        },
        { label: "Other", suburbs: ["Other"] },
      ],
    },
    {
      label: "Queensland",
      cities: [
        {
          label: "Brisbane",
          suburbs: [
            "Fortitude Valley", "South Brisbane", "West End", "New Farm", "Paddington",
            "Chermside", "Carindale", "Mount Gravatt", "Indooroopilly", "Toowong",
            "Coorparoo", "Kangaroo Point", "Spring Hill", "Milton", "Bowen Hills",
            "Other",
          ],
        },
        {
          label: "Gold Coast",
          suburbs: [
            "Surfers Paradise", "Broadbeach", "Southport", "Robina", "Burleigh Heads",
            "Coolangatta", "Mermaid Beach", "Nerang", "Helensvale", "Palm Beach",
            "Other",
          ],
        },
        {
          label: "Sunshine Coast",
          suburbs: [
            "Maroochydore", "Mooloolaba", "Noosa Heads", "Caloundra", "Coolum Beach",
            "Nambour", "Buderim", "Sippy Downs", "Other",
          ],
        },
        {
          label: "Townsville",
          suburbs: [
            "North Ward", "South Townsville", "West End", "Kirwan", "Aitkenvale",
            "Mundingburra", "Douglas", "Other",
          ],
        },
        {
          label: "Cairns",
          suburbs: [
            "Cairns City", "Manunda", "Manoora", "Edge Hill", "Redlynch",
            "Earlville", "Smithfield", "Trinity Beach", "Yorkeys Knob", "Palm Cove",
            "Other",
          ],
        },
        {
          label: "Mackay",
          suburbs: [
            "Mackay City", "West Mackay", "North Mackay", "South Mackay",
            "East Mackay", "Andergrove", "Beaconsfield", "Other",
          ],
        },
        {
          label: "Rockhampton",
          suburbs: [
            "Rockhampton City", "North Rockhampton", "South Rockhampton",
            "Allenstown", "Frenchville", "Gracemere", "Park Avenue", "Wandal",
            "Other",
          ],
        },
        {
          label: "Toowoomba",
          suburbs: [
            "Toowoomba City", "East Toowoomba", "West Toowoomba",
            "South Toowoomba", "North Toowoomba", "Darling Heights",
            "Rangeville", "Middle Ridge", "Other",
          ],
        },
        {
          label: "Mount Isa",
          suburbs: [
            "Mount Isa City", "Parkside", "Pioneer", "Ryan",
            "Sunset", "The Gap", "Townview", "Other",
          ],
        },
        { label: "Other", suburbs: ["Other"] },
      ],
    },
    {
      label: "Western Australia",
      cities: [
        {
          label: "Perth",
          suburbs: [
            "Northbridge", "Fremantle", "Subiaco", "Leederville", "Mount Lawley",
            "Cottesloe", "Scarborough", "Joondalup", "Midland", "Cannington",
            "South Perth", "Victoria Park", "Bayswater", "Other",
          ],
        },
        {
          label: "Bunbury",
          suburbs: [
            "Bunbury CBD", "South Bunbury", "East Bunbury",
            "Withers", "Usher", "Carey Park", "Other",
          ],
        },
        {
          label: "Mandurah",
          suburbs: [
            "Mandurah CBD", "Mandurah East", "Erskine", "Greenfields",
            "Dudley Park", "Falcon", "Halls Head", "Other",
          ],
        },
        {
          label: "Albany",
          suburbs: [
            "Albany CBD", "Mount Clarence", "Middleton Beach",
            "Mount Melville", "Spencer Park", "Yakamia", "Other",
          ],
        },
        {
          label: "Broome",
          suburbs: [
            "Broome CBD", "Cable Beach", "Djugun", "Other",
          ],
        },
        {
          label: "Geraldton",
          suburbs: [
            "Geraldton CBD", "Tarcoola Beach", "Mount Tarcoola",
            "Beresford", "Utakarra", "Wandina", "Other",
          ],
        },
        {
          label: "Kalgoorlie",
          suburbs: [
            "Kalgoorlie CBD", "Boulder", "South Kalgoorlie",
            "West Kalgoorlie", "Hannans", "Somerville", "Other",
          ],
        },
        { label: "Other", suburbs: ["Other"] },
      ],
    },
    {
      label: "South Australia",
      cities: [
        {
          label: "Adelaide",
          suburbs: [
            "North Adelaide", "Norwood", "Unley", "Prospect", "Glenelg",
            "Henley Beach", "Mile End", "Brooklyn Park", "Marion", "Edwardstown",
            "Magill", "Burnside", "Parkside", "Other",
          ],
        },
        {
          label: "Mount Gambier",
          suburbs: [
            "Mount Gambier CBD", "Suttontown", "Melaleuca Park", "Compton", "Other",
          ],
        },
        {
          label: "Whyalla",
          suburbs: [
            "Whyalla Playford", "Whyalla Norrie", "Whyalla Stuart",
            "Whyalla Jenkins", "Other",
          ],
        },
        {
          label: "Port Augusta",
          suburbs: [
            "Port Augusta CBD", "Davenport", "Port Augusta West", "Other",
          ],
        },
        { label: "Other", suburbs: ["Other"] },
      ],
    },
    {
      label: "Tasmania",
      cities: [
        {
          label: "Hobart",
          suburbs: [
            "Battery Point", "Sandy Bay", "New Town", "Moonah", "Lenah Valley",
            "Glenorchy", "Kingston", "Clarence Point", "Other",
          ],
        },
        {
          label: "Launceston",
          suburbs: [
            "Launceston CBD", "Invermay", "Newnham", "Mowbray",
            "Kings Meadows", "Prospect", "Riverside", "Norwood", "Other",
          ],
        },
        {
          label: "Devonport",
          suburbs: [
            "Devonport CBD", "East Devonport", "Spreyton", "Miandetta", "Other",
          ],
        },
        {
          label: "Burnie",
          suburbs: [
            "Burnie CBD", "Park Grove", "Romaine", "Acton", "Other",
          ],
        },
        { label: "Other", suburbs: ["Other"] },
      ],
    },
    {
      label: "Australian Capital Territory",
      cities: [
        {
          label: "Canberra",
          suburbs: [
            "Civic", "Braddon", "Kingston", "Manuka", "Deakin",
            "Belconnen", "Gungahlin", "Tuggeranong", "Woden", "Dickson",
            "Fyshwick", "Hughes", "Lyneham", "O'Connor", "Other",
          ],
        },
        { label: "Other", suburbs: ["Other"] },
      ],
    },
    {
      label: "Northern Territory",
      cities: [
        {
          label: "Darwin",
          suburbs: [
            "Stuart Park", "Parap", "Fannie Bay", "Nightcliff", "Casuarina",
            "Palmerston", "Karama", "Malak", "Other",
          ],
        },
        {
          label: "Alice Springs",
          suburbs: [
            "Alice Springs CBD", "Araluen", "Braitling", "The Gap",
            "Larapinta", "Mount Johns", "Desert Springs", "Gillen", "Sadadeen",
            "Other",
          ],
        },
        {
          label: "Katherine",
          suburbs: [
            "Katherine CBD", "Katherine South", "Katherine East", "Cossack", "Other",
          ],
        },
        { label: "Other", suburbs: ["Other"] },
      ],
    },
  ],
};

export const STATE_CODE_MAP: Record<string, string> = {
  "New South Wales": "NSW",
  "Victoria": "VIC",
  "Queensland": "QLD",
  "Western Australia": "WA",
  "South Australia": "SA",
  "Tasmania": "TAS",
  "Australian Capital Territory": "ACT",
  "Northern Territory": "NT",
};

export const STATE_NAME_MAP: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory",
};

export const POSTCODE_MAP: Record<string, Record<string, string>> = {
  NSW: {
    "Surry Hills": "2010", "Bondi": "2026", "Parramatta": "2150", "Newtown": "2042", "Manly": "2095",
    "Chatswood": "2067", "Hornsby": "2077", "Penrith": "2750", "Liverpool": "2170", "Campbelltown": "2560",
    "Cronulla": "2230", "Randwick": "2031", "Paddington": "2021", "Mosman": "2088", "North Sydney": "2060",
    "Redfern": "2016", "Burwood": "2134", "Strathfield": "2135",
    "Merewether": "2291", "Charlestown": "2290", "Hamilton": "2303", "Mayfield": "2304", "Wallsend": "2287",
    "Broadmeadow": "2292", "New Lambton": "2305", "Waratah": "2298", "Carrington": "2294", "Stockton": "2295",
    "Gwynneville": "2500", "Fairy Meadow": "2519", "Figtree": "2525", "Corrimal": "2518", "Dapto": "2530",
    "Unanderra": "2526", "Port Kembla": "2505", "Thirroul": "2515",
    "Erina": "2250", "Gosford": "2250", "Terrigal": "2260", "Tuggerah": "2259", "Ourimbah": "2258",
    "Woy Woy": "2256", "Umina": "2257", "Avoca Beach": "2251",
    "Ashmont": "2650", "Turvey Park": "2650", "Kooringal": "2650", "Estella": "2650", "Lake Albert": "2650",
    "Bourkelands": "2650", "Kapooka": "2661",
    "Lavington": "2641", "Thurgoona": "2640", "North Albury": "2640", "East Albury": "2640",
    "South Albury": "2640", "West Albury": "2640",
    "East Dubbo": "2830", "South Dubbo": "2830", "West Dubbo": "2830", "Dubbo CBD": "2830",
    "West Orange": "2800", "East Orange": "2800", "South Orange": "2800", "North Orange": "2800", "Orange CBD": "2800",
    "West Bathurst": "2795", "Kelso": "2795", "Eglinton": "2795", "Bathurst CBD": "2795",
  },
  VIC: {
    "Fitzroy": "3065", "Richmond": "3121", "South Yarra": "3141", "Carlton": "3053", "St Kilda": "3182",
    "Brunswick": "3056", "Prahran": "3181", "Collingwood": "3066", "Footscray": "3011", "Preston": "3072",
    "Dandenong": "3175", "Frankston": "3199", "Glen Waverley": "3150", "Doncaster": "3108", "Box Hill": "3128",
    "Camberwell": "3124", "Kew": "3101", "Brighton": "3186", "Hawthorn": "3122", "Malvern": "3144",
    "Waurn Ponds": "3216", "Grovedale": "3216", "Newtown": "3220", "Highton": "3216", "Belmont": "3216",
    "Lara": "3212", "Ocean Grove": "3226", "Torquay": "3228",
    "Wendouree": "3355", "Sebastopol": "3356", "Alfredton": "3350", "Mount Clear": "3350", "Buninyong": "3357",
    "Lake Wendouree": "3350",
    "Epsom": "3551", "Kangaroo Flat": "3555", "Strathdale": "3550", "Golden Square": "3555",
    "North Bendigo": "3550", "California Gully": "3556",
    "Shepparton South": "3630", "Mooroopna": "3629", "Kialla": "3631", "Shepparton East": "3630", "Grahamvale": "3630",
    "Mildura South": "3500", "Irymple": "3498", "Nichols Point": "3501", "Merbein": "3505",
  },
  QLD: {
    "Fortitude Valley": "4006", "South Brisbane": "4101", "West End": "4101", "New Farm": "4005", "Paddington": "4064",
    "Chermside": "4032", "Carindale": "4152", "Mount Gravatt": "4122", "Indooroopilly": "4068", "Toowong": "4066",
    "Coorparoo": "4151", "Kangaroo Point": "4169", "Spring Hill": "4000", "Milton": "4064", "Bowen Hills": "4006",
    "Surfers Paradise": "4217", "Broadbeach": "4218", "Southport": "4215", "Robina": "4226", "Burleigh Heads": "4220",
    "Coolangatta": "4225", "Mermaid Beach": "4218", "Nerang": "4211", "Helensvale": "4212", "Palm Beach": "4221",
    "Maroochydore": "4558", "Mooloolaba": "4557", "Noosa Heads": "4567", "Caloundra": "4551", "Coolum Beach": "4573",
    "Nambour": "4560", "Buderim": "4556", "Sippy Downs": "4556",
    "North Ward": "4810", "South Townsville": "4810", "Kirwan": "4817", "Aitkenvale": "4814",
    "Mundingburra": "4812", "Douglas": "4814",
    "Cairns City": "4870", "Manunda": "4870", "Manoora": "4870", "Edge Hill": "4870", "Redlynch": "4870",
    "Earlville": "4870", "Smithfield": "4878", "Trinity Beach": "4879", "Yorkeys Knob": "4878", "Palm Cove": "4879",
    "Mackay City": "4740", "West Mackay": "4740", "North Mackay": "4740", "South Mackay": "4740",
    "East Mackay": "4740", "Andergrove": "4740", "Beaconsfield": "4740",
    "Rockhampton City": "4700", "North Rockhampton": "4701", "South Rockhampton": "4700",
    "Allenstown": "4700", "Frenchville": "4701", "Gracemere": "4702", "Park Avenue": "4701", "Wandal": "4700",
    "Toowoomba City": "4350", "East Toowoomba": "4350", "West Toowoomba": "4350",
    "South Toowoomba": "4350", "North Toowoomba": "4350", "Darling Heights": "4350",
    "Rangeville": "4350", "Middle Ridge": "4350",
    "Mount Isa City": "4825", "Parkside": "4825", "Pioneer": "4825", "Ryan": "4825",
    "Sunset": "4825", "The Gap": "4825", "Townview": "4825",
  },
  WA: {
    "Northbridge": "6003", "Fremantle": "6160", "Subiaco": "6008", "Leederville": "6007", "Mount Lawley": "6050",
    "Cottesloe": "6011", "Scarborough": "6019", "Joondalup": "6027", "Midland": "6056", "Cannington": "6107",
    "South Perth": "6151", "Victoria Park": "6100", "Bayswater": "6053",
    "Bunbury CBD": "6230", "South Bunbury": "6230", "East Bunbury": "6230", "Withers": "6230", "Usher": "6230", "Carey Park": "6230",
    "Mandurah CBD": "6210", "Mandurah East": "6210", "Erskine": "6210", "Greenfields": "6210",
    "Dudley Park": "6210", "Falcon": "6210", "Halls Head": "6210",
    "Albany CBD": "6330", "Mount Clarence": "6330", "Middleton Beach": "6330",
    "Mount Melville": "6330", "Spencer Park": "6330", "Yakamia": "6330",
    "Broome CBD": "6725", "Cable Beach": "6726", "Djugun": "6725",
    "Geraldton CBD": "6530", "Tarcoola Beach": "6530", "Mount Tarcoola": "6530",
    "Beresford": "6530", "Utakarra": "6530", "Wandina": "6530",
    "Kalgoorlie CBD": "6430", "Boulder": "6432", "South Kalgoorlie": "6430",
    "West Kalgoorlie": "6430", "Hannans": "6430", "Somerville": "6430",
  },
  SA: {
    "North Adelaide": "5006", "Norwood": "5067", "Unley": "5061", "Prospect": "5082", "Glenelg": "5045",
    "Henley Beach": "5022", "Mile End": "5031", "Brooklyn Park": "5032", "Marion": "5043", "Edwardstown": "5039",
    "Magill": "5072", "Burnside": "5066", "Parkside": "5063",
    "Mount Gambier CBD": "5290", "Suttontown": "5290", "Melaleuca Park": "5290", "Compton": "5290",
    "Whyalla Playford": "5600", "Whyalla Norrie": "5608", "Whyalla Stuart": "5608", "Whyalla Jenkins": "5600",
    "Port Augusta CBD": "5700", "Davenport": "5700", "Port Augusta West": "5700",
  },
  TAS: {
    "Battery Point": "7004", "Sandy Bay": "7005", "New Town": "7008", "Moonah": "7009", "Lenah Valley": "7008",
    "Glenorchy": "7010", "Kingston": "7050", "Clarence Point": "7270",
    "Launceston CBD": "7250", "Invermay": "7248", "Newnham": "7248", "Mowbray": "7248",
    "Kings Meadows": "7249", "Prospect": "7250", "Riverside": "7250", "Norwood": "7250",
    "Devonport CBD": "7310", "East Devonport": "7310", "Spreyton": "7310", "Miandetta": "7310",
    "Burnie CBD": "7320", "Park Grove": "7320", "Romaine": "7320", "Acton": "7320",
  },
  ACT: {
    "Civic": "2601", "Braddon": "2612", "Kingston": "2604", "Manuka": "2603", "Deakin": "2600",
    "Belconnen": "2617", "Gungahlin": "2912", "Tuggeranong": "2900", "Woden": "2606", "Dickson": "2602",
    "Fyshwick": "2609", "Hughes": "2605", "Lyneham": "2605", "O'Connor": "2601",
  },
  NT: {
    "Stuart Park": "0820", "Parap": "0820", "Fannie Bay": "0820",
    "Nightcliff": "0810", "Casuarina": "0810", "Karama": "0810", "Malak": "0810",
    "Palmerston": "0830",
    "Alice Springs CBD": "0870", "Araluen": "0870", "Braitling": "0870", "Larapinta": "0870",
    "Mount Johns": "0870", "Desert Springs": "0870", "Gillen": "0870", "Sadadeen": "0870",
    "Katherine CBD": "0850", "Katherine South": "0850", "Katherine East": "0850", "Cossack": "0850",
  },
};

export function getStates(country: string): { label: string; hasCities: boolean }[] {
  const config = ADDRESS_CONFIG[country];
  if (!config) return [];
  return config.map((s) => ({ label: s.label, hasCities: s.cities.length > 0 }));
}

export function getCities(country: string, state: string): string[] {
  const config = ADDRESS_CONFIG[country];
  if (!config) return [];
  const stateEntry = config.find((s) => s.label === state);
  if (!stateEntry) return [];
  return stateEntry.cities.map((c) => c.label);
}

export function getSuburbs(country: string, state: string, city: string): string[] {
  const config = ADDRESS_CONFIG[country];
  if (!config) return [];
  const stateEntry = config.find((s) => s.label === state);
  if (!stateEntry) return [];
  const cityEntry = stateEntry.cities.find((c) => c.label === city);
  if (!cityEntry) return [];
  return cityEntry.suburbs;
}

export function getPostcode(suburb: string, state?: string): string {
  if (state) {
    const stateMap = POSTCODE_MAP[state];
    if (stateMap && stateMap[suburb]) return stateMap[suburb];
  }
  for (const stateMap of Object.values(POSTCODE_MAP)) {
    if (stateMap[suburb]) return stateMap[suburb];
  }
  return "";
}

export function normalizeState(state: string): string {
  const s = state?.trim().toLowerCase() || "";
  const match = Object.keys(STATE_CODE_MAP).find((k) => k.toLowerCase() === s);
  if (match) return STATE_CODE_MAP[match];
  const upper = state?.trim().toUpperCase() || "";
  if (["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].includes(upper)) return upper;
  return upper;
}

export function paypalFormat(address: {
  street: string;
  suburb?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}): {
  address_line_1: string;
  address_line_2?: string;
  admin_area_2: string;
  admin_area_1: string;
  postal_code: string;
  country_code: string;
} {
  const stateCode = normalizeState(address.state);
  const postcode = getPostcode(address.suburb || "") || address.postcode;
  return {
    address_line_1: address.street.trim(),
    address_line_2: address.suburb?.trim() || undefined,
    admin_area_2: address.city.trim(),
    admin_area_1: stateCode,
    postal_code: postcode,
    country_code: "AU",
  };
}
