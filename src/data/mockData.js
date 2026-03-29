// ── Mock Data for VelocityPro Admin Panel ──

export const dashboardStats = {
  totalOrders: 12482,
  totalOrdersTrend: '+14%',
  revenue: 284500,
  revenueTrend: '+22%',
  activeUsers: 3204,
  activeUsersTrend: 'Stable',
  pendingOrders: 142,
  pendingOrdersTrend: 'High'
};

export const revenueData = [
  { name: 'Mon', value: 4200 },
  { name: 'Tue', value: 5800 },
  { name: 'Wed', value: 4600 },
  { name: 'Thu', value: 7200 },
  { name: 'Fri', value: 6100 },
  { name: 'Sat', value: 8400 },
  { name: 'Sun', value: 7600 },
  { name: 'Mon', value: 5200 },
  { name: 'Tue', value: 9100 },
  { name: 'Wed', value: 8800 },
  { name: 'Thu', value: 7400 },
  { name: 'Fri', value: 6800 },
];

export const topMovers = [
  { id: 1, name: 'Lunar Max Runners', sold: '1.2k Sold This Week', price: 129.00, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop' },
  { id: 2, name: 'Velocity Pro-Series 4', sold: '943 Sold This Week', price: 349.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop' },
  { id: 3, name: 'Aura Wireless ANC', sold: '876 Sold This Week', price: 210.00, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop' },
  { id: 4, name: 'RetroShot Mini X', sold: '512 Sold This Week', price: 499.00, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=80&h=80&fit=crop' },
];

export const recentOrders = [
  { id: '#ORD-90214', customer: 'Jared Dunn', amount: 244.50, date: 'Oct 24, 2023 • 14:22', status: 'Delivered', avatar: 'JD' },
  { id: '#ORD-90215', customer: 'Bertram Gilfoyle', amount: 1029.00, date: 'Oct 24, 2023 • 15:05', status: 'Packed', avatar: 'BG' },
  { id: '#ORD-90216', customer: 'Dinesh Chugtai', amount: 89.10, date: 'Oct 24, 2023 • 19:44', status: 'Pending', avatar: 'DC' },
  { id: '#ORD-90217', customer: 'Monica Hall', amount: 450.00, date: 'Oct 24, 2023 • 16:12', status: 'Delivered', avatar: 'MH' },
  { id: '#ORD-90218', customer: 'Richard Hendricks', amount: 3420.00, date: 'Oct 24, 2023 • 18:40', status: 'Packed', avatar: 'RH' },
];

export const criticalAlerts = [
  { id: 1, type: 'stock', title: 'Stock Critically Low', desc: 'Wireless ANC Headphones Gold Edition is nearly exhausted in Node 7', action: 'RESTOCK NOW' },
  { id: 2, type: 'delivery', title: 'Delivery Lag Node-8', desc: 'Average delivery times increased by 14% in East Metropolitan area due to weather' },
  { id: 3, type: 'system', title: 'System Update', desc: 'v4.2.0 Core-Engine scheduled maintenance at 02:00 UTC tomorrow' },
];

export const mockProducts = [
  { id: 'VP-9021', name: 'Nike Air Max Pro-X', category: 'Footwear', price: 189.00, discount: 15, stock: 1240, status: 'active', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop' },
  { id: 'VP-8824', name: 'Quantum Chronograph', category: 'Accessories', price: 2450.00, discount: 0, stock: 12, status: 'low', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop' },
  { id: 'VP-3312', name: 'Acoustic Pro Gen 2', category: 'Electronics', price: 349.99, discount: 5, stock: 450, status: 'active', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop' },
  { id: 'VP-4421', name: 'Urban Backpack Elite', category: 'Accessories', price: 129.99, discount: 0, stock: 890, status: 'active', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=120&h=120&fit=crop' },
  { id: 'VP-5567', name: 'Smart Fitness Band', category: 'Electronics', price: 79.99, discount: 10, stock: 2100, status: 'active', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=120&h=120&fit=crop' },
  { id: 'VP-6690', name: 'Classic Leather Watch', category: 'Accessories', price: 599.00, discount: 0, stock: 5, status: 'low', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=120&h=120&fit=crop' },
  { id: 'VP-7712', name: 'Running Shorts Pro', category: 'Footwear', price: 49.99, discount: 20, stock: 3400, status: 'active', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=120&h=120&fit=crop' },
  { id: 'VP-8834', name: 'Wireless Earbuds X1', category: 'Electronics', price: 159.00, discount: 0, stock: 670, status: 'active', image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=120&h=120&fit=crop' },
  { id: 'VP-9945', name: 'Titanium Sunglasses', category: 'Accessories', price: 289.00, discount: 8, stock: 320, status: 'active', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&h=120&fit=crop' },
  { id: 'VP-1056', name: 'Trail Hiking Boots', category: 'Footwear', price: 219.00, discount: 0, stock: 180, status: 'active', image: 'https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=120&h=120&fit=crop' },
];

export const mockCategories = [
  { id: '1', name: 'Footwear', productCount: 124, icon: '👟', color: '#7c3aed' },
  { id: '2', name: 'Electronics', productCount: 89, icon: '🎧', color: '#3b82f6' },
  { id: '3', name: 'Accessories', productCount: 210, icon: '⌚', color: '#10b981' },
  { id: '4', name: 'Clothing', productCount: 356, icon: '👕', color: '#f59e0b' },
  { id: '5', name: 'Home & Living', productCount: 178, icon: '🏠', color: '#ec4899' },
  { id: '6', name: 'Sports', productCount: 95, icon: '⚽', color: '#06b6d4' },
];

export const mockCustomers = [
  { id: 'VP-99234', name: 'Sophia Jenkins', email: 'sophia.j@example.com', phone: '+1 (555) 012-3456', orders: 24, lastActive: '2 hours ago', location: 'New York, USA', status: 'active', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
  { id: 'VP-88120', name: 'Marcus Chen', email: 'm.chen@outlook.com', phone: '+44 20 7946 0123', orders: 18, lastActive: 'Yesterday', location: 'London, UK', status: 'active', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
  { id: 'VP-77451', name: 'Elena Rodriguez', email: 'elena.rod@gmail.com', phone: '+34 912 34 5678', orders: 42, lastActive: 'Just now', location: 'Madrid, ES', status: 'active', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
  { id: 'VP-55672', name: 'David Kim', email: 'd.kim@techno.io', phone: '+82 2-312-4567', orders: 9, lastActive: '5 days ago', location: 'Seoul, KR', status: 'inactive', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
  { id: 'VP-44321', name: 'Amara Johnson', email: 'amara.j@mail.com', phone: '+1 (555) 789-0123', orders: 31, lastActive: '1 hour ago', location: 'Chicago, USA', status: 'active', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop' },
  { id: 'VP-33210', name: 'Liam O\'Brien', email: 'liam.ob@corp.ie', phone: '+353 1 234 5678', orders: 15, lastActive: '3 days ago', location: 'Dublin, IE', status: 'active', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop' },
];

export const mockDeliveryPartners = [
  { id: 'VP-9201', name: 'Marcus Thorne', rating: 4.92, totalOrders: 1248, status: 'In Delivery', online: true, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { id: 'VP-8821', name: 'Elena Rodriguez', rating: 4.85, totalOrders: 892, status: 'Available', online: true, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 'VP-9043', name: 'Sarah Chen', rating: 4.98, totalOrders: 2410, status: 'Inactive', online: false, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: 'VP-7731', name: 'Julian Weber', rating: 4.72, totalOrders: 542, status: 'Returning', online: true, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
];

export const mockInventory = {
  totalValue: 1428900,
  lowStockItems: [
    { id: 'VEL-CF-480', name: 'Artisan Coffee Roast (500g)', unitsLeft: 12, sku: 'VEL-CF-480' },
    { id: 'VEL-OM-104', name: 'Organic Almond Milk', unitsLeft: 45, sku: 'VEL-OM-104' },
    { id: 'VEL-FB-032', name: 'Fresh Blueberries (250g)', unitsLeft: 28, sku: 'VEL-FB-032' },
  ],
  movementHistory: [
    { time: 'Today, 14:22', type: 'ORDER', entity: 'Artisan Roast', action: 'ORDER DEDUCTION', adjustment: -2, orderId: '#C9910' },
    { time: 'Today, 11:05', type: 'RESTOCK', entity: 'Fresh Avocado', action: 'SUPPLIER RESTOCK', adjustment: 250, batchId: '#IC-1002' },
    { time: 'Today, 09:45', type: 'ORDER', entity: 'Almond Milk', action: 'ORDER DEDUCTION', adjustment: -1, orderId: '#C9512' },
    { time: 'Yesterday, 18:15', type: 'RESTOCK', entity: 'Fresh Blueberries', action: 'SUPPLIER RESTOCK', adjustment: 100, batchId: '#IO-1001' },
    { time: 'Yesterday, 16:30', type: 'DAMAGED', entity: 'Dish Liquid', action: 'DAMAGED GOODS', adjustment: -12, adminNote: 'CORRECTION' },
  ],
};

export const mockOrders = [
  { id: '#ORD-90214', customer: 'Jared Dunn', email: 'jared@piedpiper.com', amount: 244.50, date: 'Oct 24, 2023', time: '14:22', status: 'Delivered', items: ['Wireless Earbuds', 'USB-C Cable'], address: '123 Main St, San Francisco, CA', payment: 'Credit Card', deliveryPartner: 'Marcus Thorne' },
  { id: '#ORD-90215', customer: 'Bertram Gilfoyle', email: 'gilfoyle@piedpiper.com', amount: 1029.00, date: 'Oct 24, 2023', time: '15:05', status: 'Packed', items: ['Smart Watch Pro', 'Leather Strap'], address: '456 Oak Ave, Palo Alto, CA', payment: 'PayPal', deliveryPartner: null },
  { id: '#ORD-90216', customer: 'Dinesh Chugtai', email: 'dinesh@piedpiper.com', amount: 89.10, date: 'Oct 24, 2023', time: '19:44', status: 'Pending', items: ['Phone Case', 'Screen Protector'], address: '789 Pine St, Mountain View, CA', payment: 'Debit Card', deliveryPartner: null },
  { id: '#ORD-90217', customer: 'Monica Hall', email: 'monica@raviga.com', amount: 450.00, date: 'Oct 24, 2023', time: '16:12', status: 'Delivered', items: ['Nike Air Max', 'Running Socks'], address: '321 Elm Dr, San Jose, CA', payment: 'Credit Card', deliveryPartner: 'Elena Rodriguez' },
  { id: '#ORD-90218', customer: 'Richard Hendricks', email: 'richard@piedpiper.com', amount: 3420.00, date: 'Oct 24, 2023', time: '18:40', status: 'Packed', items: ['MacBook Stand', 'Mechanical Keyboard', 'Monitor Light'], address: '654 Birch Ln, Sunnyvale, CA', payment: 'Apple Pay', deliveryPartner: 'Sarah Chen' },
  { id: '#ORD-90219', customer: 'Erlich Bachman', email: 'erlich@aviato.com', amount: 612.00, date: 'Oct 23, 2023', time: '11:30', status: 'Out for Delivery', items: ['Premium Headphones', 'Amp DAC'], address: '987 Cedar Ct, Cupertino, CA', payment: 'Credit Card', deliveryPartner: 'Julian Weber' },
  { id: '#ORD-90220', customer: 'Laurie Bream', email: 'laurie@raviga.com', amount: 178.50, date: 'Oct 23, 2023', time: '09:15', status: 'Delivered', items: ['Yoga Mat', 'Water Bottle'], address: '147 Maple St, Los Altos, CA', payment: 'PayPal', deliveryPartner: 'Marcus Thorne' },
  { id: '#ORD-90221', customer: 'Gavin Belson', email: 'gavin@hooli.com', amount: 5200.00, date: 'Oct 23, 2023', time: '14:50', status: 'Cancelled', items: ['Gold Necklace', 'Diamond Ring'], address: '258 Walnut Ave, Menlo Park, CA', payment: 'Wire Transfer', deliveryPartner: null },
];

export const mockCoupons = [
  { id: '1', code: 'VELOCITY20', discount: 20, type: 'percentage', minOrder: 100, maxDiscount: 50, validUntil: '2024-12-31', usageCount: 342, status: 'active' },
  { id: '2', code: 'FLAT50OFF', discount: 50, type: 'fixed', minOrder: 200, maxDiscount: 50, validUntil: '2024-06-30', usageCount: 156, status: 'active' },
  { id: '3', code: 'NEWUSER10', discount: 10, type: 'percentage', minOrder: 0, maxDiscount: 25, validUntil: '2025-01-01', usageCount: 890, status: 'active' },
  { id: '4', code: 'SUMMER30', discount: 30, type: 'percentage', minOrder: 150, maxDiscount: 75, validUntil: '2024-03-01', usageCount: 45, status: 'expired' },
];

export const performanceData = [
  { time: '08:00 AM', value: 94.5 },
  { time: '09:00 AM', value: 95.2 },
  { time: '10:00 AM', value: 93.8 },
  { time: '11:00 AM', value: 96.2 },
  { time: '12:00 PM', value: 95.8 },
  { time: '01:00 PM', value: 94.1 },
  { time: '02:00 PM', value: 93.5 },
  { time: '03:00 PM', value: 95.5 },
  { time: '04:00 PM', value: 96.8 },
  { time: '05:00 PM', value: 95.2 },
  { time: '06:00 PM', value: 94.8 },
  { time: '07:00 PM', value: 93.2 },
  { time: '08:00 PM', value: 94.9 },
];

export const analyticsData = {
  weeklyRevenue: [
    { name: 'Week 1', revenue: 42000, orders: 320 },
    { name: 'Week 2', revenue: 58000, orders: 410 },
    { name: 'Week 3', revenue: 51000, orders: 380 },
    { name: 'Week 4', revenue: 67000, orders: 490 },
  ],
  categoryBreakdown: [
    { name: 'Footwear', value: 35 },
    { name: 'Electronics', value: 28 },
    { name: 'Accessories', value: 22 },
    { name: 'Clothing', value: 15 },
  ],
};
