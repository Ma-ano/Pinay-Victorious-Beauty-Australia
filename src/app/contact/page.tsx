"use client";

import { site } from "@/data/site";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest">Get in Touch</p>
          <h1 className="text-3xl md:text-5xl font-bold text-dark mt-2">Contact Us</h1>
          <p className="mt-3 text-foreground">We&apos;d love to hear from you</p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-dark mb-1.5">Name</label>
              <input id="name" type="text" required
                className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-1.5">Email</label>
              <input id="email" type="email" required
                className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-dark mb-1.5">Message</label>
              <textarea id="message" rows={5} required
                className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm resize-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/80 transition-colors text-sm">
              Send Message
            </button>
          </form>

          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-6 border border-card-border">
              <h3 className="font-semibold text-dark text-sm mb-4">Contact Details</h3>
              <div className="space-y-3 text-sm text-foreground">
                {[
                  { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", content: <a href={`mailto:${site.email}`} className="hover:text-accent transition-colors">{site.email}</a> },
                  { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", content: <span>{site.phone}</span> },
                  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z", content: <span>{site.address}</span> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.content}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-card-border">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>PayPal accepted</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.7443225331466!2d151.2073038!3d-33.8719187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12ae3b3b3b3b3b%3A0x5017d681632bfc0!2sSydney%20NSW%2C%20Australia!5e0!3m2!1sen!2s!4v1"
                width="100%"
                height="250"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Beauty Store Location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
