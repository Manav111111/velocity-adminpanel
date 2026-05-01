import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, writeBatch
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateDocument = async (collectionName, id, data) => {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName, id) => {
  await deleteDoc(doc(db, collectionName, id));
};

// ── Batch Delete (for Danger Zone) ────────────────────────────────────────────

/**
 * Delete ALL documents in a collection using batched writes.
 * Firestore batches are limited to 500 operations each.
 * @param {string} collectionName
 * @returns {number} count of deleted documents
 */
export const deleteAllDocuments = async (collectionName) => {
  const snap = await getDocs(collection(db, collectionName));
  const docs = snap.docs;
  let deleted = 0;

  // Process in batches of 500
  const batchSize = 500;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + batchSize);
    chunk.forEach(d => batch.delete(d.ref));
    await batch.commit();
    deleted += chunk.length;
  }

  return deleted;
};

// ── Batch Add (for Bulk Upload) ───────────────────────────────────────────────

/**
 * Add multiple documents to a collection using batched writes.
 * @param {string} collectionName
 * @param {Array} items - array of data objects
 * @returns {number} count of added documents
 */
export const batchAddDocuments = async (collectionName, items) => {
  let added = 0;
  const batchSize = 500;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = items.slice(i, i + batchSize);
    chunk.forEach(item => {
      const ref = doc(collection(db, collectionName));
      batch.set(ref, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    added += chunk.length;
  }

  return added;
};

/**
 * Upsert (update or add) multiple documents using batched writes.
 * @param {string} collectionName
 * @param {Array} items - array of { id?: string, data: object }
 * @returns {number} count of processed documents
 */
export const batchUpsertDocuments = async (collectionName, items) => {
  let processed = 0;
  const batchSize = 500;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = items.slice(i, i + batchSize);
    
    chunk.forEach(({ id, data }) => {
      const ref = id ? doc(db, collectionName, id) : doc(collection(db, collectionName));
      // Use merge: true so we don't overwrite fields not provided in the CSV
      batch.set(ref, {
        ...data,
        updatedAt: serverTimestamp(),
        // Only set createdAt if it's a new document (id not provided)
        ...(id ? {} : { createdAt: serverTimestamp() })
      }, { merge: true });
    });
    
    await batch.commit();
    processed += chunk.length;
  }

  return processed;
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
