export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  link: string;
  gradient: string;
}

export const promotions: Promotion[] = [
  {
    id: "p1",
    title: "First Order Bonus",
    description: "Get 20% off your first purchase when you sign up for our newsletter.",
    code: "WELCOME20",
    discount: "20% OFF",
    link: "/shop",
    gradient: "from-accent/20 via-primary/20 to-accent/10",
  },
  {
    id: "p2",
    title: "Free Shipping",
    description: "Free standard shipping on all orders over $50. No code needed.",
    code: "AUTO",
    discount: "FREE SHIP",
    link: "/shop",
    gradient: "from-secondary/30 via-primary/10 to-secondary/20",
  },
  {
    id: "p3",
    title: "Buy One Get One",
    description: "Buy any skincare product and get a second one free. Mix and match!",
    code: "BOGOSKIN",
    discount: "BOGO",
    link: "/shop?category=skincare",
    gradient: "from-primary/20 via-accent/10 to-primary/20",
  },
  {
    id: "p4",
    title: "Loyalty Reward",
    description: "Earn double points on all purchases this month. Redeem for exclusive products.",
    code: "DUBLPNTS",
    discount: "2X POINTS",
    link: "/sale",
    gradient: "from-purple-200/30 via-pink-100/20 to-purple-200/30",
  },
];
