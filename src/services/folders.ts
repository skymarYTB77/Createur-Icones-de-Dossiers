import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  DocumentData 
} from 'firebase/firestore';

export interface ImageSettings {
  size: number;
  brightness: number;
  contrast: number;
  saturation: number;
  opacity: number;
  hue: number;
  blur: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

export interface FolderIcon {
  id?: string;
  userId: string;
  name: string;
  folderColor: string;
  overlayImage?: string;
  imageSettings?: ImageSettings;
  createdAt?: Date;
}

export interface Preset {
  id?: string;
  userId: string;
  name: string;
  imageSettings: ImageSettings;
  createdAt?: Date;
}

export const saveFolderIcon = async (folderIcon: Omit<FolderIcon, 'createdAt'>) => {
  try {
    if (folderIcon.id) {
      const docRef = doc(db, 'folderIcons', folderIcon.id);
      const { id, ...updateData } = folderIcon;
      await updateDoc(docRef, updateData);
      return id;
    } else {
      const docRef = await addDoc(collection(db, 'folderIcons'), {
        ...folderIcon,
        createdAt: new Date()
      });
      return docRef.id;
    }
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

export const updateFolderIcon = async (iconId: string, data: Partial<FolderIcon>) => {
  try {
    const docRef = doc(db, 'folderIcons', iconId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating folder icon:', error);
    throw error;
  }
};

export const savePreset = async (preset: Omit<Preset, 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'presets'), {
      ...preset,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving preset:', error);
    throw error;
  }
};

export const getUserPresets = async (userId: string): Promise<Preset[]> => {
  try {
    const q = query(
      collection(db, 'presets'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Preset[];
  } catch (error) {
    console.error('Error fetching user presets:', error);
    throw error;
  }
};

export const deletePreset = async (presetId: string) => {
  try {
    await deleteDoc(doc(db, 'presets', presetId));
  } catch (error) {
    console.error('Error deleting preset:', error);
    throw error;
  }
};