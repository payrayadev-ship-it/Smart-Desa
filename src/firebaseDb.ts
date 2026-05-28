import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  getDocs,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  Resident, 
  Letter, 
  FinanceTransaction, 
  VillageAsset, 
  Complaint, 
  VillageAnnouncement, 
  VillageAgenda, 
  AuditLog, 
  VillageProfile 
} from './types';

// Seeding/Mock Data defaults to use if firestore is empty
import { 
  INITIAL_VILLAGE_PROFILE 
} from './mockData';

/**
 * Handle user authentication dynamically based on current selected role.
 * This guarantees the user gets logged into Firebase Auth and creates their profile
 * document in the 'users' collection so that Firestore Security Rules recognize their role.
 */
export async function authenticateFirebaseUser(name: string, role: string, nik?: string) {
  try {
    // 1. Silent anonymous authentication fallback
    let userCredential = auth.currentUser;
    if (!userCredential) {
      try {
        const res = await signInAnonymously(auth);
        userCredential = res.user;
      } catch (authErr: any) {
        if (authErr && (authErr.code === 'auth/admin-restricted-operation' || String(authErr.message).includes('admin-restricted-operation'))) {
          throw new Error(
            "Firebase Anonymous Auth is restricted (disabled). Silakan aktifkan penyedia \"Anonymous\" di Firebase Console > Authentication > Sign-in method untuk mengaktifkan sinkronisasi awan, atau jalankan menggunakan penyimpanan lokal."
          );
        }
        throw authErr;
      }
    }
    
    if (!userCredential) {
      throw new Error("Gagal memperoleh otentikasi Firebase Auth.");
    }

    const uid = userCredential.uid;
    console.log(`Firebase User Authenticated. UID: ${uid}, Role: ${role}`);

    // 2. Create or Update user profile in Firestore
    const userProfilePath = `users/${uid}`;
    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        name,
        role,
        nik: nik || '',
        createdAt: new Date().toISOString()
      });
      console.log(`Profil pengguna berhasil disinkronkan ke Firestore: ${userProfilePath}`);
    } catch (e) {
      // Log error but don't block auth flow for offline fallback
      console.warn("Gagal memperbarui profil pengguna di Firestore. Kemungkinan aturan diblokir sebelum profil diaktifkan.", e);
    }

    return uid;
  } catch (error: any) {
    console.warn("Firebase Authentication Info (Offline mode enabled):", error?.message || error);
    throw error;
  }
}

/**
 * Perform a test save to Firestore to verify connection health.
 */
export async function saveTestConnectionDoc(): Promise<boolean> {
  const testPath = 'test';
  const docId = 'connection_test_doc';
  try {
    const testDocRef = doc(db, testPath, docId);
    await setDoc(testDocRef, {
      status: 'success',
      timestamp: new Date().toISOString(),
      message: 'Koneksi Firestore Berhasil dan Siap Produksi!'
    });
    console.log("Firestore test connection save was successful!");
    return true;
  } catch (error) {
    console.error("Firestore test connection failed:", error);
    handleFirestoreError(error, OperationType.WRITE, `${testPath}/${docId}`);
    return false;
  }
}

/**
 * Generic Real-Time Firestore Collection Subscriber with Auto-Seeding logic.
 * If Firestore list is empty, it will auto-insert the initial data mapping automatically.
 */
export function subscribeCollectionWithSeed<T>(
  collectionPath: string,
  initialData: T[],
  onUpdate: (data: T[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, collectionPath);
  
  // Realtime subscription using onSnapshot
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialData && initialData.length > 0) {
      console.log(`Koleksi '${collectionPath}' kosong. Memulai seeding otomatis data awal...`);
      try {
        // Sequentially create docs of mock data
        for (const item of initialData) {
          const typedItem = item as any;
          const docId = typedItem.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          await setDoc(doc(db, collectionPath, docId), {
            ...typedItem,
            id: docId
          });
        }
        console.log(`Seeding otomatis koleksi '${collectionPath}' berhasil diselesaikan.`);
      } catch (err) {
        console.error(`Gagal melakukan seeding otomatis pada '${collectionPath}':`, err);
      }
    } else {
      const parsedItems: T[] = [];
      snapshot.forEach((snapshotDoc) => {
        parsedItems.push({
          ...(snapshotDoc.data() as T),
          id: snapshotDoc.id
        });
      });
      onUpdate(parsedItems);
    }
  }, (error) => {
    console.error(`Gagal mendengarkan update pada koleksi '${collectionPath}':`, error);
    if (onError) onError(error);
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  });
}

/**
 * Live Single Document Subscriber specifically for Settings / Village Profile.
 */
export function subscribeSingleDoc<T>(
  collectionPath: string,
  docId: string,
  initialDefault: T,
  onUpdate: (data: T) => void
) {
  const docRef = doc(db, collectionPath, docId);
  
  return onSnapshot(docRef, async (snapshot) => {
    if (!snapshot.exists()) {
      console.log(`Dokumen '${collectionPath}/${docId}' belum ada. Membuat dengan nilai default...`);
      try {
        await setDoc(docRef, initialDefault as any);
      } catch (err) {
        console.error(`Gagal menginisialisasi dokumen '${collectionPath}/${docId}':`, err);
      }
    } else {
      onUpdate(snapshot.data() as T);
    }
  }, (error) => {
    console.error(`Gagal berlangganan dokumen '${collectionPath}/${docId}':`, error);
    handleFirestoreError(error, OperationType.GET, `${collectionPath}/${docId}`);
  });
}

/**
 * Helper to recursively sanitize data objects before passing to Firestore,
 * preventing 'Unsupported field value: undefined' errors which crash database transactions/batches.
 */
export function sanitizeData(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = sanitizeData(val);
    }
  }
  return result;
}

/**
 * Update / Set single record securely in any collection.
 */
export async function saveRecord(collectionPath: string, docId: string, data: any) {
  try {
    const sanitized = sanitizeData(data);
    await setDoc(doc(db, collectionPath, docId), {
      ...sanitized,
      id: docId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`Berhasil menyimpan data ke ${collectionPath}/${docId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
  }
}

/**
 * Add brand new document auto generating ID if not specified.
 */
export async function addRecord(collectionPath: string, data: any): Promise<string> {
  try {
    const sanitized = sanitizeData(data);
    const colRef = collection(db, collectionPath);
    const docRef = await addDoc(colRef, {
      ...sanitized,
      createdAt: new Date().toISOString()
    });
    
    // Write ID back inside document to keep structure congruent
    await setDoc(docRef, { id: docRef.id }, { merge: true });
    
    console.log(`Berhasil menambahkan dokumen baru ke ${collectionPath} dengan ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
    throw error;
  }
}

/**
 * Delete a document from collection.
 */
export async function deleteRecord(collectionPath: string, docId: string) {
  try {
    await deleteDoc(doc(db, collectionPath, docId));
    console.log(`Berhasil menghapus dokumen ${collectionPath}/${docId}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${docId}`);
  }
}

/**
 * Synchronize a list to Firestore using batch-writes to ensure atomicity, high performance, and data consistency.
 */
export async function syncListToFirestoreBatch(collectionPath: string, currentItems: any[], nextItems: any[]): Promise<void> {
  try {
    const currentIds = currentItems.map(item => item.id);
    const nextIds = nextItems.map(item => item.id);
    const deletedIds = currentIds.filter(id => id && !nextIds.includes(id));

    const operations: { type: 'set' | 'delete'; docId: string; data?: any }[] = [];

    // 1. Queue delete operations
    for (const id of deletedIds) {
      operations.push({ type: 'delete', docId: id });
    }

    // 2. Queue set (create / update) operations
    for (const item of nextItems) {
      const docId = item.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const cleanItem = sanitizeData(item);
      if (!cleanItem.id) cleanItem.id = docId;
      
      cleanItem.updatedAt = new Date().toISOString();
      operations.push({ type: 'set', docId, data: cleanItem });
    }

    if (operations.length === 0) return;

    // Split write operations into chunks to avoid Firestore's limit of 500 writes per batch
    const CHUNK_SIZE = 450;
    for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
      const chunk = operations.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      for (const op of chunk) {
        const docRef = doc(db, collectionPath, op.docId);
        if (op.type === 'delete') {
          batch.delete(docRef);
        } else {
          batch.set(docRef, op.data, { merge: true });
        }
      }

      await batch.commit();
    }
    console.log(`Berhasil menyinkronkan batch ke ${collectionPath} - total: ${operations.length} operasi.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}
