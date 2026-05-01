import {
  addDocument, updateDocument, deleteDocument,
  subscribeToCollectionOrdered, deleteAllDocuments
} from './firestoreService';

// ── Subscribe ─────────────────────────────────────────────────────────────────

export const subscribeToBanners = (callback) => {
  return subscribeToCollectionOrdered('banners', 'priority', 'asc', callback);
};

// ── CRUD ──────────────────────────────────────────────────────────────────────

export const addBanner = async (data) => {
  return addDocument('banners', {
    title: data.title?.trim() || '',
    subtitle: data.subtitle?.trim() || '',
    imageUrl: data.imageUrl || '',
    isActive: data.isActive !== false,
    priority: parseInt(data.priority) || 0,
  });
};

export const updateBanner = async (id, data) => {
  return updateDocument('banners', id, {
    title: data.title?.trim() || '',
    subtitle: data.subtitle?.trim() || '',
    imageUrl: data.imageUrl || '',
    isActive: data.isActive !== false,
    priority: parseInt(data.priority) || 0,
  });
};

export const deleteBanner = async (id) => {
  return deleteDocument('banners', id);
};

export const deleteAllBanners = async () => {
  return deleteAllDocuments('banners');
};
