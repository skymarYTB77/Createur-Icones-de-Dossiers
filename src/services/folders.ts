import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, DocumentData } from 'firebase/firestore';

export interface FolderIcon {
  id?: string;
  userId: string;
  folderColor: string;
  overlayImage?: string;
  imageSettings?: {
    size: number;
    brightness: number;
    contrast: number;
    saturation: number;
    opacity: number;
    hue: number;
    blur: number;
  };
  createdAt?: Date;
}

export const saveFolderIcon = async (folderIcon: Omit<FolderIcon, 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'folderIcons'), {
      ...folderIcon,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving folder icon:', error);
    throw error;
  }
};

export const getUserFolderIcons = async (userId: string): Promise<FolderIcon[]> => {
  try {
    const q = query(
      collection(db, 'folderIcons'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as FolderIcon[];
  } catch (error) {
    console.error('Error fetching user folder icons:', error);
    throw error;
  }
};

export const deleteFolderIcon = async (iconId: string) => {
  try {
    await deleteDoc(doc(db, 'folderIcons', iconId));
  } catch (error) {
    console.error('Error deleting folder icon:', error);
    throw error;
  }
};