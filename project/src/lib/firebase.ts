import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCl24z3KL07CnZ1wFexfIUtR0jzwXu1i0I",
  authDomain: "gestionnaire-de-taches-8fafd.firebaseapp.com",
  projectId: "gestionnaire-de-taches-8fafd",
  storageBucket: "gestionnaire-de-taches-8fafd.appspot.com",
  messagingSenderId: "298034237874",
  appId: "1:298034237874:web:xxxxx" // Remplacez xxxxx par votre appId complet
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('La persistance hors ligne nécessite un seul onglet ouvert à la fois.');
  } else if (err.code === 'unimplemented') {
    console.warn('Le navigateur ne supporte pas la persistance hors ligne.');
  }
});