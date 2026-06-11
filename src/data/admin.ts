export interface Order {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
}

export const adminStats = {
  totalRevenue: 45280,
  totalOrders: 1247,
  totalProducts: 156,
  totalCustomers: 892,
  revenueChange: 12.5,
  ordersChange: 8.3,
  productsChange: -2.1,
  customersChange: 15.7,
};

export const recentOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "Sarah Johnson",
    email: "sarah.j@email.com",
    items: 3,
    total: 128.0,
    status: "delivered",
    date: "2026-06-10",
  },
  {
    id: "ORD-002",
    customer: "Emily Clarke",
    email: "emily.c@email.com",
    items: 1,
    total: 48.0,
    status: "shipped",
    date: "2026-06-09",
  },
  {
    id: "ORD-003",
    customer: "Jessica Brown",
    email: "jessica.b@email.com",
    items: 2,
    total: 73.0,
    status: "processing",
    date: "2026-06-08",
  },
  {
    id: "ORD-004",
    customer: "Olivia Wilson",
    email: "olivia.w@email.com",
    items: 4,
    total: 195.0,
    status: "pending",
    date: "2026-06-08",
  },
  {
    id: "ORD-005",
    customer: "Mia Davis",
    email: "mia.d@email.com",
    items: 2,
    total: 110.0,
    status: "cancelled",
    date: "2026-06-07",
  },
  {
    id: "ORD-006",
    customer: "Sophie Martinez",
    email: "sophie.m@email.com",
    items: 1,
    total: 35.0,
    status: "delivered",
    date: "2026-06-07",
  },
  {
    id: "ORD-007",
    customer: "Amanda Taylor",
    email: "amanda.t@email.com",
    items: 3,
    total: 142.0,
    status: "shipped",
    date: "2026-06-06",
  },
  {
    id: "ORD-008",
    customer: "Isabella Anderson",
    email: "isabella.a@email.com",
    items: 2,
    total: 87.0,
    status: "processing",
    date: "2026-06-06",
  },
];
