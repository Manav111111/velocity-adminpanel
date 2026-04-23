import { writeFileSync } from 'fs';
import('./src/services/firebase.js').then(async (mod) => {
  const { collection, getDocs, addDoc } = await import('firebase/firestore');
  const db = mod.db;
  
  // 1. Get all products
  const productsSnap = await getDocs(collection(db, 'products'));
  const uniqueCategories = new Set();
  
  productsSnap.docs.forEach(d => {
    const cat = d.data().category;
    if (cat) uniqueCategories.add(cat);
  });
  
  console.log(`Found ${uniqueCategories.size} unique categories in products.`);

  // 2. Get existing categories
  const catsSnap = await getDocs(collection(db, 'categories'));
  const existingCats = new Set();
  catsSnap.docs.forEach(d => {
    existingCats.add(d.data().name.toLowerCase().trim());
  });

  console.log(`Found ${existingCats.size} existing categories.`);

  // 3. Create missing categories
  let createdCount = 0;
  for (const cat of uniqueCategories) {
    const key = cat.toLowerCase().trim();
    if (!existingCats.has(key)) {
      console.log(`Creating category: ${cat}`);
      await addDoc(collection(db, 'categories'), {
        name: cat,
        icon: '📦',
        color: '#7c3aed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      existingCats.add(key);
      createdCount++;
    }
  }

  console.log(`Successfully created ${createdCount} missing categories!`);
  process.exit(0);
}).catch(console.error);
