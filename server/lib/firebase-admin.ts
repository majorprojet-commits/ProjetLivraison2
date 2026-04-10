import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const getDb = () => {
  const databaseId = firebaseConfig.firestoreDatabaseId;
  return getFirestore(databaseId);
};
