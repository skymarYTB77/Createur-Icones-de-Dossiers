import { FolderStyle } from '../types/folder';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

// Collection des styles de dossiers
const STYLES_COLLECTION = 'folderStyles';

// Fonction pour récupérer tous les styles
export const getFolderStyles = async (): Promise<FolderStyle[]> => {
  const querySnapshot = await getDocs(collection(db, STYLES_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as FolderStyle[];
};

// Fonction pour ajouter un nouveau style (admin uniquement)
export const addFolderStyle = async (style: Omit<FolderStyle, 'id'>) => {
  await addDoc(collection(db, STYLES_COLLECTION), style);
};

// Fonction pour supprimer un style (admin uniquement)
export const deleteFolderStyle = async (styleId: string) => {
  await deleteDoc(doc(db, STYLES_COLLECTION, styleId));
};

// Fonction pour appliquer les paramètres au rendu
export const applyImageSettings = (ctx: CanvasRenderingContext2D, settings: ImageSettings) => {
  ctx.filter = `
    brightness(${settings.brightness}%)
    contrast(${settings.contrast}%)
    saturate(${settings.saturation}%)
    opacity(${settings.opacity}%)
  `;
};