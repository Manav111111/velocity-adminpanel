import { writeFileSync } from 'fs';
import('./src/services/firebase.js').then(async (mod) => {
  const { collection, getDocs } = await import('firebase/firestore');
  const snap = await getDocs(collection(mod.db, 'categories'));
  const names = snap.docs.map(d => d.data().name);
  writeFileSync('cats.json', JSON.stringify(names, null, 2), 'utf8');
  process.exit(0);
}).catch(console.error);
