// Firebase Configuration
// Firebase project: planneroptifine
// Web app configuration for image upload and phase tracking

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration from user's project
const firebaseConfig = {
  apiKey: "AIzaSyCkUKJ2eOhsS5A1MB6P66buc4QNs45nXEc",
  authDomain: "planneroptifine.firebaseapp.com",
  projectId: "planneroptifine",
  storageBucket: "planneroptifine.firebasestorage.app",
  messagingSenderId: "455140502235",
  appId: "1:455140502235:web:dbe1abc212943b35b8fafe",
  measurementId: "G-DZJSCW1GM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Firestore functions
export const getPhaseData = async (userId, phaseId) => {
  try {
    const docRef = doc(db, 'users', userId, 'phases', `phase_${phaseId}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting phase data:', error);
    return null;
  }
};

export const updatePhaseData = async (userId, phaseId, data) => {
  try {
    const docRef = doc(db, 'users', userId, 'phases', `phase_${phaseId}`);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating phase data:', error);
    return false;
  }
};

// Storage functions
export const uploadPhaseImage = async (userId, phaseId, file) => {
  try {
    // Create a unique file name with timestamp
    const fileName = `users/${userId}/phases/phase_${phaseId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Get all phase data for a user
export const getAllPhaseData = async (userId) => {
  try {
    const phasesCollection = collection(db, 'users', userId, 'phases');
    const querySnapshot = await getDocs(phasesCollection);
    const phasesData = {};
    
    querySnapshot.forEach((doc) => {
      phasesData[doc.id] = doc.data();
    });
    
    return phasesData;
  } catch (error) {
    console.error('Error getting all phase data:', error);
    return {};
  }
};

export default app;