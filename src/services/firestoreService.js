import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// ── Generic CRUD ──────────────────────────────────────────────────────────────

export const getCollection = async (collectionName) => {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getDocument = async (collectionName, id) => {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const addDocument = async (collectionName, data) => {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return ref.id;
};

export const updateDocument = async (collectionName, id, data) => {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteDocument = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
};

// ── Query Helpers ─────────────────────────────────────────────────────────────

export const queryCollection = async (collectionName, field, operator, value) => {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Real-time Listeners ───────────────────────────────────────────────────────

/**
 * Subscribe to all documents in a collection (unordered).
 * Returns an unsubscribe function.
 */
export const subscribeToCollection = (collectionName, callback) => {
  return onSnapshot(collection(db, collectionName), (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  }, (error) => {
    console.error(`subscribeToCollection [${collectionName}] error:`, error);
  });
};

/**
 * Subscribe to a collection ordered by a field.
 * @param {string} collectionName
 * @param {string} field         - field to order by (e.g. 'createdAt')
 * @param {'asc'|'desc'} direction
 * @param {function} callback    - receives array of documents
 * Returns an unsubscribe function.
 */
export const subscribeToCollectionOrdered = (collectionName, field, direction, callback) => {
  const q = query(collection(db, collectionName), orderBy(field, direction));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  }, (error) => {
    console.error(`subscribeToCollectionOrdered [${collectionName}] error:`, error);
  });
};
