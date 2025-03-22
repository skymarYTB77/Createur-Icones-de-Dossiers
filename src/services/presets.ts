import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ImageSettings, OverlaySettings, TextSettings } from '../types/folder';

export interface Preset {
  id?: string;
  userId: string;
  name: string;
  imageSettings: ImageSettings;
  overlaySettings: OverlaySettings;
  textSettings: TextSettings;
  createdAt: Date;
}

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