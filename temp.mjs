import { readFileSync, writeFileSync } from 'fs';
import('./src/services/firebase.js').then(async (mod) => {
  const { collection, getDocs } = await import('firebase/firestore');
  const snap = await getDocs(collection(mod.db, 'orders'));
  const first = snap.docs[0].data();
  writeFileSync('order.json', JSON.stringify(first, null, 2), 'utf8');
  process.exit(0);
}).catch(console.error);
