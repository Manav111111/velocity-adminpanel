import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getCountFromServer,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalise an order status string to lowercase-trimmed form.
 */
export const normalise = (s = '') => (s || '').toLowerCase().trim();

/**
 * Safely convert a Firestore Timestamp, ISO string, or Date to a JS Date.
 */
export const toDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();           // Firestore Timestamp
  if (value instanceof Date) return value;
  return new Date(value);                             // ISO string / millis
};

/**
 * Format a date value (Timestamp | ISO string | Date) to a readable string.
 */
export const formatOrderDate = (value) => {
  const d = toDate(value);
  if (!d || isNaN(d)) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// ── Real-time Orders Listener ─────────────────────────────────────────────────

/**
 * Subscribe to all orders ordered by createdAt descending.
 * @param {function} callback - receives array of order objects
 * @returns unsubscribe function
 */
// Normalize order objects to support variations in mobile app fields
const normalizeOrder = (docSnap) => {
  const data = docSnap.data();
  // Map fields from 'total', 'products' if standard fields are missing
  return {
    id: docSnap.id,
    ...data,
    totalAmount: typeof data.totalAmount === 'number' && data.totalAmount !== 0 ? data.totalAmount : (data.total || 0),
    items: (data.items && data.items.length > 0) ? data.items : (data.products || data.cartItems || []),
  };
};

export const subscribeToOrders = (callback) => {
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map(normalizeOrder);
      callback(orders);
    },
    (error) => {
      console.error('subscribeToOrders error:', error);
      callback([]);
    }
  );
};

/**
 * Subscribe to the N most-recent orders (for dashboard).
 * @param {number} n
 * @param {function} callback
 * @returns unsubscribe function
 */
export const subscribeToRecentOrders = (n = 8, callback) => {
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc'),
    limit(n)
  );

  return onSnapshot(
    q,
    (snap) => {
      const orders = snap.docs.map(normalizeOrder);
      callback(orders);
    },
    (error) => {
      console.error('subscribeToRecentOrders error:', error);
      callback([]);
    }
  );
};

// ── Status Update ─────────────────────────────────────────────────────────────

/**
 * Update an order's status field in Firestore.
 * @param {string} orderId
 * @param {string} newStatus
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  await updateDoc(doc(db, 'orders', orderId), {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────

/**
 * Get aggregate dashboard stats: order count, revenue, product count, user count.
 * Returns an object with: totalOrders, totalRevenue, totalProducts, totalUsers, pendingOrders
 */
export const getDashboardStats = async () => {
  try {
    const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'orders')),
      getCountFromServer(collection(db, 'products')),
      getCountFromServer(collection(db, 'users')),
    ]);

    const orders = ordersSnap.docs.map(normalizeOrder);
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const totalProducts = productsSnap.data().count;
    const totalUsers = usersSnap.data().count;

    return { totalOrders, totalRevenue, totalProducts, totalUsers, pendingOrders };
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalUsers: 0, pendingOrders: 0 };
  }
};

/**
 * Subscribe to live dashboard stats (re-computes whenever orders change).
 * @param {function} callback - receives stats object
 * @returns unsubscribe function
 */
export const subscribeToDashboardStats = (callback) => {
  const q = query(collection(db, 'orders'));
  return onSnapshot(
    q,
    async (snap) => {
      const orders = snap.docs.map(normalizeOrder);
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;

      // Product + user counts (not real-time, refresh on order change is fine)
      let totalProducts = 0;
      let totalUsers = 0;
      try {
        const [pSnap, uSnap] = await Promise.all([
          getCountFromServer(collection(db, 'products')),
          getCountFromServer(collection(db, 'users')),
        ]);
        totalProducts = pSnap.data().count;
        totalUsers = uSnap.data().count;
      } catch (_) { /* ignore count errors */ }

      callback({ totalOrders, totalRevenue, totalProducts, totalUsers, pendingOrders });
    },
    (error) => {
      console.error('subscribeToDashboardStats error:', error);
    }
  );
};
