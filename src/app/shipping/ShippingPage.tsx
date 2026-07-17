import { site } from "@/data/site";

const shippingRates = [
  { range: "Under $120 AUD", standard: "$10.70", express: "$15.20" },
  { range: "$120 AUD and above", standard: "FREE", express: "$5.00 AUD Express Upgrade" },
];

const deliveryTimeframes = [
  { method: "Standard Australia Post Delivery", estimate: "2–8 business days" },
  { method: "Express Australia Post Delivery", estimate: "1–4 business days" },
];

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-accent font-semibold text-sm uppercase tracking-widest">Shipping</p>
      <h1 className="text-3xl md:text-4xl font-bold text-dark mt-2">Shipping Policy</h1>
      <p className="mt-1 text-xs text-foreground">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Shipping Information</h2>
          <p>
            Welcome to {site.name}. We are an Australian online beauty store offering carefully selected
            skincare, cosmetics, and personal care products.
          </p>
          <p className="mt-2">
            We carefully prepare and pack every order to ensure your products arrive safely. All orders are
            shipped through Australia Post.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Order Processing</h2>
          <p>
            Orders are usually processed and dispatched within <strong>1–2 business days</strong> after
            payment has been successfully received. Orders are prepared Monday to Friday, excluding public
            holidays.
          </p>
          <p className="mt-2">
            Once your order has been dispatched, you will receive a confirmation email containing your
            Australia Post tracking information. Please allow up to 24 hours for tracking information to
            become available after your parcel has been lodged with Australia Post.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Shipping Rates</h2>
          <p>
            Shipping fees are calculated based on your final order value after discounts, promotional codes,
            or vouchers have been applied.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left px-4 py-2.5 font-semibold text-dark">Final Order Value</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-dark">Standard Shipping</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-dark">Express Shipping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {shippingRates.map((row) => (
                  <tr key={row.range}>
                    <td className="px-4 py-2.5 text-foreground">{row.range}</td>
                    <td className="px-4 py-2.5 text-foreground font-medium">{row.standard}</td>
                    <td className="px-4 py-2.5 text-foreground font-medium">{row.express}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Delivery Timeframes</h2>
          <div className="mt-2 space-y-3">
            {deliveryTimeframes.map((d) => (
              <div key={d.method} className="flex items-center justify-between bg-primary/5 rounded-xl px-4 py-3">
                <span className="text-foreground">{d.method}</span>
                <span className="text-dark font-semibold">{d.estimate}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-foreground/70">
            Delivery timeframes are estimates only and may vary depending on delivery location, regional
            or remote areas, Australia Post network conditions, public holidays, peak shopping periods,
            weather events, or other circumstances outside our control. Once your parcel has been
            dispatched, delivery timeframes are managed by Australia Post.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Tracking Your Order</h2>
          <p>
            All orders are sent with Australia Post tracking. Your tracking number will be emailed to you
            once your order has been dispatched. Customers may use the Australia Post tracking service to
            monitor delivery progress.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Delivery Address Responsibility</h2>
          <p>
            Customers are responsible for providing accurate delivery details during checkout. Please ensure
            your name, address, unit/apartment details, postcode, and contact information are correct before
            completing your purchase.
          </p>
          <p className="mt-2">
            {site.name} is not responsible for delays caused by incorrect or incomplete delivery information.
            If a parcel is returned to us due to an incorrect address, failed delivery, unclaimed parcel, or
            customer not collecting the parcel, additional postage charges may apply before the order can be
            resent.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Lost, Damaged or Missing Parcels</h2>
          <p>
            We carefully inspect and package every order before dispatch. If your parcel arrives damaged, is
            missing, or you believe it has been lost during transit, please contact us as soon as possible.
            We will assist you and work with Australia Post where required.
          </p>
          <p className="mt-2">
            Once Australia Post confirms a parcel has been delivered, {site.name} cannot be responsible for
            parcels that are lost, stolen, or misplaced after delivery.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-dark mb-2">Contact Us</h2>
          <p>
            For shipping enquiries, please email us at{" "}
            <a href={`mailto:${site.email}`} className="text-accent hover:underline">
              {site.email}
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
