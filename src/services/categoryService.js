import {
  addDocument, updateDocument, deleteDocument,
  subscribeToCollection, deleteAllDocuments
} from './firestoreService';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

// ── Subscribe ─────────────────────────────────────────────────────────────────

export const subscribeToCategories = (callback) => {
  return subscribeToCollection('categories', callback);
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const addCategory = async (data) => {
  return addDocument('categories', {
    name: data.name?.trim() || '',
    imageUrl: data.imageUrl || '',
  });
};

export const updateCategory = async (id, data) => {
  return updateDocument('categories', id, {
    name: data.name?.trim() || '',
    imageUrl: data.imageUrl || '',
  });
};

export const deleteCategory = async (id) => {
  // Cascading delete: find all products with this categoryId
  const q = query(collection(db, 'products'), where('categoryId', '==', id));
  const snap = await getDocs(q);
  
  const batch = writeBatch(db);
  // Delete all associated products
  snap.docs.forEach(d => batch.delete(d.ref));
  // Delete the category itself
  batch.delete(doc(db, 'categories', id));
  
  await batch.commit();
  return snap.docs.length; // return count of deleted products
};

export const deleteAllCategories = async () => {
  return deleteAllDocuments('categories');
};
