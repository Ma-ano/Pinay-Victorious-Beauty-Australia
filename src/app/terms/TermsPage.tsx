import { site } from "@/data/site";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-accent font-semibold text-sm uppercase tracking-widest">Legal</p>
      <h1 className="text-3xl md:text-4xl font-bold text-dark mt-2">Terms of Service</h1>
      <p className="mt-1 text-xs text-foreground">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">1. About Our Store</h2>
          <p>Pinay Victorious Beauty Shop is an Australian online beauty store dedicated to bringing quality beauty, skincare, and personal care products closer to our customers across Australia.</p>
          <p className="mt-2">Founded with a passion for beauty and self-care, we aim to provide access to carefully selected products that help our customers feel confident, beautiful, and empowered in their everyday lives.</p>
          <p className="mt-2">We proudly celebrate the beauty community by offering a range of products inspired by popular beauty trends from the Philippines, Asia, and around the world.</p>
          <p className="mt-2">Our goal is simple: To make beauty products more accessible, affordable, and enjoyable while providing a reliable and welcoming online shopping experience for our customers.</p>
          <p className="mt-2">We carefully select our products, prepare every order with care, and strive to provide excellent customer service from purchase to delivery.</p>
          <p className="mt-2">Thank you for supporting Pinay Victorious Beauty Australia and being part of our growing beauty community.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">2. Products & Product Information</h2>
          <p>We make every effort to ensure all product descriptions, images, ingredients, and information are accurate.</p>
          <p className="mt-2">However, manufacturers may update:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Packaging;</li>
            <li>Ingredients;</li>
            <li>Colours;</li>
            <li>Product appearance.</li>
          </ul>
          <p className="mt-2">Beauty results vary between individuals.</p>
          <p className="mt-2">Customers are responsible for checking product suitability and ingredients before use.</p>
          <p className="mt-2">We recommend patch testing new skincare products before full application.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">3. Orders</h2>
          <p>Orders are subject to product availability and successful payment confirmation.</p>
          <p className="mt-2">We reserve the right to cancel or refuse orders due to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Stock availability issues;</li>
            <li>Incorrect pricing;</li>
            <li>Website errors;</li>
            <li>Suspected fraudulent activity; or</li>
            <li>Other reasonable circumstances.</li>
          </ul>
          <p className="mt-2">If payment has already been received, a refund will be provided.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">4. Pricing & Payments</h2>
          <p>All prices are displayed in Australian Dollars (AUD).</p>
          <p className="mt-2">Prices may change without notice.</p>
          <p className="mt-2">Orders will only be processed after payment has been successfully completed.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">5. Shipping</h2>
          <p>We currently ship within Australia only.</p>
          <p className="mt-2">All orders are delivered through Australia Post.</p>
          <p className="mt-2">Shipping fees are calculated based on final order value after discounts and promotional codes.</p>
          <p className="mt-2">Delivery timeframes are estimates only and may be affected by Australia Post operations, public holidays, weather, peak periods, and circumstances outside our control.</p>
          <p className="mt-2">Customers are responsible for providing correct delivery information.</p>
          <p className="mt-2">For complete details, please refer to our Shipping Policy.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">6. Returns & Refunds</h2>
          <p>Returns and refunds are handled according to our Return & Refund Policy.</p>
          <p className="mt-2">Due to hygiene requirements, opened or used beauty products cannot be returned unless they are faulty or covered under Australian Consumer Law.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">7. Beauty Product Disclaimer</h2>
          <p>Our products are intended for cosmetic and personal care purposes only.</p>
          <p className="mt-2">We do not provide medical advice.</p>
          <p className="mt-2">Customers should seek professional advice if they have concerns regarding allergies, skin conditions, or product suitability.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">8. Website Content</h2>
          <p>All website content including:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Images;</li>
            <li>Logos;</li>
            <li>Text;</li>
            <li>Designs;</li>
            <li>Product information;</li>
          </ul>
          <p className="mt-2">belongs to Pinay Victorious Beauty Shop or authorised partners.</p>
          <p className="mt-2">Content may not be copied or used without permission.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by Australian law, Pinay Victorious Beauty Australia is not responsible for losses caused by circumstances outside our reasonable control.</p>
          <p className="mt-2">This does not affect your rights under Australian Consumer Law.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">10. Changes to These Terms</h2>
          <p>We may update these Terms of Service from time to time.</p>
          <p className="mt-2">Any changes will become effective once published on our website.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Contact Us</h2>
          <p>Pinay Victorious Beauty Shop</p>
          <p className="mt-1">Email: <a href={`mailto:${site.email}`} className="text-accent hover:underline">{site.email}</a></p>
        </section>
      </div>
    </div>
  );
}
