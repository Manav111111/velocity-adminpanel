import {
  addDocument, updateDocument, deleteDocument,
  subscribeToCollection, subscribeToCollectionOrdered,
  deleteAllDocuments, batchAddDocuments, batchUpsertDocuments
} from './firestoreService';

// ── Subscribe ─────────────────────────────────────────────────────────────────

export const subscribeToProducts = (callback) => {
  return subscribeToCollectionOrdered('products', 'createdAt', 'desc', callback);
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const addProduct = async (data) => {
  return addDocument('products', {
    name: data.name?.trim() || '',
    sku: data.sku?.trim().toUpperCase() || '',
    price: parseFloat(data.price) || 0,
    discount: parseInt(data.discount) || 0,
    stock: parseInt(data.stock) || 0,
    categoryId: data.categoryId || '',
    images: data.images || [],
    isFeatured: Boolean(data.isFeatured),
    isTrending: Boolean(data.isTrending),
    isActive: data.isActive !== false, // default true
  });
};

export const updateProduct = async (id, data) => {
  return updateDocument('products', id, {
    name: data.name?.trim() || '',
    sku: data.sku?.trim().toUpperCase() || '',
    price: parseFloat(data.price) || 0,
    discount: parseInt(data.discount) || 0,
    stock: parseInt(data.stock) || 0,
    categoryId: data.categoryId || '',
    images: data.images || [],
    isFeatured: Boolean(data.isFeatured),
    isTrending: Boolean(data.isTrending),
    isActive: data.isActive !== false,
  });
};

export const deleteProduct = async (id) => {
  return deleteDocument('products', id);
};

export const deleteAllProducts = async () => {
  return deleteAllDocuments('products');
};

export const bulkUpsertProducts = async (items) => {
  return batchUpsertDocuments('products', items);
};
