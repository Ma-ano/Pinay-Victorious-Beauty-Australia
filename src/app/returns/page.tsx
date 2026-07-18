import { site } from "@/data/site";

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-accent font-semibold text-sm uppercase tracking-widest">Returns</p>
      <h1 className="text-3xl md:text-4xl font-bold text-dark mt-2">Return & Refund Policy</h1>
      <p className="mt-1 text-xs text-foreground">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">1. Our Commitment</h2>
          <p>At Pinay Victorious Beauty Shop, customer satisfaction is important to us.</p>
          <p className="mt-2">Every order is carefully checked and packed before leaving our store.</p>
          <p className="mt-2">Due to the nature of beauty and personal care products, we follow strict hygiene guidelines when handling returns.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">2. Change of Mind Returns</h2>
          <p>We do not accept returns or exchanges for change-of-mind purchases.</p>
          <p className="mt-2">Please carefully review product details, ingredients, and suitability before placing your order.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">3. Beauty Product Returns</h2>
          <p>For health, safety, and hygiene reasons, we cannot accept returns for beauty or personal care products that have been:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Opened;</li>
            <li>Used;</li>
            <li>Tested;</li>
            <li>Removed from sealed packaging; or</li>
            <li>Damaged after delivery.</li>
          </ul>
          <p className="mt-2">This includes skincare, cosmetics, and personal care products.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">4. Faulty, Damaged or Incorrect Items</h2>
          <p>If you receive an item that is:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Faulty;</li>
            <li>Damaged;</li>
            <li>Incorrect; or</li>
            <li>Not as described,</li>
          </ul>
          <p className="mt-2">please contact us within <strong>7 days</strong> of receiving your order.</p>
          <p className="mt-2">Please provide:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your order number;</li>
            <li>Details of the issue; and</li>
            <li>Photos of the product and packaging.</li>
          </ul>
          <p className="mt-2">We will review your request and provide an appropriate solution, which may include replacement, exchange, or refund where applicable.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">5. Sale Items</h2>
          <p>Sale items, discounted products, and promotional purchases are final sale unless the product is faulty, damaged, or your rights under Australian Consumer Law apply.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">6. Refunds</h2>
          <p>Approved refunds will be processed to the original payment method used at checkout.</p>
          <p className="mt-2">Please allow:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>3&ndash;10 business days</strong> for your payment provider or bank to complete processing.</li>
          </ul>
          <p className="mt-2">Original shipping costs are non-refundable unless the issue was caused by an error on our behalf.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">7. Australian Consumer Law</h2>
          <p>Nothing in this Return & Refund Policy excludes or limits your rights under the Australian Consumer Law.</p>
          <p className="mt-2">You may be entitled to a remedy where a product:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Has a major fault;</li>
            <li>Is unsafe;</li>
            <li>Is not as described; or</li>
            <li>Does not meet consumer guarantees.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Contact Us</h2>
          <p>For return and refund enquiries:</p>
          <p className="mt-1">Email: <a href={`mailto:${site.email}`} className="text-accent hover:underline">{site.email}</a></p>
        </section>
      </div>
    </div>
  );
}