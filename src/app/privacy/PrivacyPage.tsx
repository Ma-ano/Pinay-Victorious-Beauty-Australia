import { site } from "@/data/site";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-accent font-semibold text-sm uppercase tracking-widest">Legal</p>
      <h1 className="text-3xl md:text-4xl font-bold text-dark mt-2">Privacy Policy</h1>
      <p className="mt-1 text-xs text-foreground">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Information We Collect</h2>
          <p>When you shop with us, we may collect personal information including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Name;</li>
            <li>Email address;</li>
            <li>Phone number;</li>
            <li>Billing address;</li>
            <li>Shipping address;</li>
            <li>Order details;</li>
            <li>Payment information processed through secure payment providers.</li>
          </ul>
          <p className="mt-2">We may also collect information about your website activity through cookies and similar technologies.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">How We Use Your Information</h2>
          <p>Your information may be used to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Process and fulfil your orders;</li>
            <li>Arrange delivery;</li>
            <li>Send order confirmations and updates;</li>
            <li>Provide customer support;</li>
            <li>Improve our website and services;</li>
            <li>Prevent fraudulent transactions;</li>
            <li>Send marketing communications where you have provided consent.</li>
          </ul>
          <p className="mt-2">We do not sell, rent, or trade your personal information.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Cookies</h2>
          <p>Our website uses cookies to improve your shopping experience.</p>
          <p className="mt-2">Cookies help us:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Remember shopping preferences;</li>
            <li>Maintain shopping cart information;</li>
            <li>Understand website traffic;</li>
            <li>Improve website performance.</li>
          </ul>
          <p className="mt-2">You may disable cookies through your browser settings, although some website features may not function correctly.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Payment Security</h2>
          <p>Payments are processed through secure third-party payment providers.</p>
          <p className="mt-2">We do not store complete payment card information on our website servers.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Sharing Your Information</h2>
          <p>We may share information only when necessary to operate our business, including with:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Payment providers;</li>
            <li>Australia Post;</li>
            <li>Website service providers;</li>
            <li>Analytics providers.</li>
          </ul>
          <p className="mt-2">These parties only receive information required to provide their services.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Protecting Your Information</h2>
          <p>We take reasonable steps to protect your personal information from:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Unauthorised access;</li>
            <li>Misuse;</li>
            <li>Loss; or</li>
            <li>Disclosure.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Contact Us</h2>
          <p>For privacy enquiries:</p>
          <p className="mt-1"><a href={`mailto:${site.email}`} className="text-accent hover:underline">{site.email}</a></p>
        </section>
      </div>
    </div>
  );
}
