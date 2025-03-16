/**
 * IndexedDB database service for storing pixel animation data
 */

// Database name and version
const DB_NAME = 'pixel_adventure';
const DB_VERSION = 1;

// Store names
const SPRITES_STORE = 'sprites';
const FRAMES_STORE = 'frames';
const FOLDERS_STORE = 'folders';
const FOLDER_FRAMES_STORE = 'folder_frames';

let db: IDBDatabase | null = null;

/**
 * Initialize the database
 */
export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    // Open database
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Handle errors
    request.onerror = (event) => {
      console.error('Error opening database:', event);
      reject(new Error('Failed to open database'));
    };

    // Handle database creation/upgrade
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains(SPRITES_STORE)) {
        db.createObjectStore(SPRITES_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(FRAMES_STORE)) {
        const framesStore = db.createObjectStore(FRAMES_STORE, { keyPath: 'id', autoIncrement: true });
        framesStore.createIndex('sprite_id', 'sprite_id', { unique: false });
      }

      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        db.createObjectStore(FOLDERS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(FOLDER_FRAMES_STORE)) {
        const folderFramesStore = db.createObjectStore(FOLDER_FRAMES_STORE, { keyPath: 'id', autoIncrement: true });
        folderFramesStore.createIndex('folder_id', 'folder_id', { unique: false });
      }
    };

    // Handle successful opening
    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      console.log('Database initialized successfully');
      resolve();
    };
  });
};

/**
 * Check if database is initialized
 */
export const isDatabaseInitialized = (): boolean => {
  return db !== null;
};

/**
 * Save a sprite set to the database
 * @param spriteData The sprite set data to save
 */
export const saveSpriteSet = (spriteData: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([SPRITES_STORE], 'readwrite');
    const store = transaction.objectStore(SPRITES_STORE);

    const request = store.put(spriteData);

    request.onerror = (event) => {
      console.error('Error saving sprite set:', event);
      reject(new Error('Failed to save sprite set'));
    };

    request.onsuccess = () => {
      resolve(spriteData.id);
    };
  });
};

/**
 * Save a frame to the database
 * @param frameData The frame data to save
 */
export const saveFrame = (frameData: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([FRAMES_STORE], 'readwrite');
    const store = transaction.objectStore(FRAMES_STORE);

    const request = store.put(frameData);

    request.onerror = (event) => {
      console.error('Error saving frame:', event);
      reject(new Error('Failed to save frame'));
    };

    request.onsuccess = (event) => {
      resolve(request.result as number);
    };
  });
};

/**
 * Get all sprite sets from the database
 */
export const getAllSpriteSets = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([SPRITES_STORE], 'readonly');
    const store = transaction.objectStore(SPRITES_STORE);
    const request = store.getAll();

    request.onerror = (event) => {
      console.error('Error getting sprite sets:', event);
      reject(new Error('Failed to get sprite sets'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

/**
 * Get frames for a sprite set
 * @param spriteId The ID of the sprite set
 */
export const getFramesForSpriteSet = (spriteId: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([FRAMES_STORE], 'readonly');
    const store = transaction.objectStore(FRAMES_STORE);
    const index = store.index('sprite_id');
    const request = index.getAll(spriteId);

    request.onerror = (event) => {
      console.error('Error getting frames:', event);
      reject(new Error('Failed to get frames'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

/**
 * Save a folder to the database
 * @param folderData The folder data to save
 */
export const saveFolder = (folderData: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([FOLDERS_STORE], 'readwrite');
    const store = transaction.objectStore(FOLDERS_STORE);
    const request = store.put(folderData);

    request.onerror = (event) => {
      console.error('Error saving folder:', event);
      reject(new Error('Failed to save folder'));
    };

    request.onsuccess = () => {
      resolve(folderData.id);
    };
  });
};

/**
 * Save frames to a folder
 * @param folderFrameData The folder frame data to save
 */
export const saveFolderFrames = (folderFrameData: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([FOLDER_FRAMES_STORE], 'readwrite');
    const store = transaction.objectStore(FOLDER_FRAMES_STORE);
    const request = store.put(folderFrameData);

    request.onerror = (event) => {
      console.error('Error saving folder frames:', event);
      reject(new Error('Failed to save folder frames'));
    };

    request.onsuccess = (event) => {
      resolve(request.result as number);
    };
  });
};

/**
 * Get all folders from the database
 */
export const getAllFolders = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([FOLDERS_STORE], 'readonly');
    const store = transaction.objectStore(FOLDERS_STORE);
    const request = store.getAll();

    request.onerror = (event) => {
      console.error('Error getting folders:', event);
      reject(new Error('Failed to get folders'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

/**
 * Get frames for a folder
 * @param folderId The ID of the folder
 */
export const getFramesForFolder = (folderId: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([FOLDER_FRAMES_STORE], 'readonly');
    const store = transaction.objectStore(FOLDER_FRAMES_STORE);
    const index = store.index('folder_id');
    const request = index.getAll(folderId);

    request.onerror = (event) => {
      console.error('Error getting folder frames:', event);
      reject(new Error('Failed to get folder frames'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

/**
 * Delete a sprite set and its frames
 * @param spriteId The ID of the sprite set to delete
 */
export const deleteSpriteSet = (spriteId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    // Delete frames first
    const framesTransaction = db.transaction([FRAMES_STORE], 'readwrite');
    const framesStore = framesTransaction.objectStore(FRAMES_STORE);
    const framesIndex = framesStore.index('sprite_id');
    const framesRequest = framesIndex.openCursor(IDBKeyRange.only(spriteId));

    framesRequest.onerror = (event) => {
      console.error('Error deleting frames:', event);
      reject(new Error('Failed to delete frames'));
    };

    framesRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        // All frames deleted, now delete the sprite set
        const spriteTransaction = db.transaction([SPRITES_STORE], 'readwrite');
        const spriteStore = spriteTransaction.objectStore(SPRITES_STORE);
        const spriteRequest = spriteStore.delete(spriteId);

        spriteRequest.onerror = (event) => {
          console.error('Error deleting sprite set:', event);
          reject(new Error('Failed to delete sprite set'));
        };

        spriteRequest.onsuccess = () => {
          resolve();
        };
      }
    };
  });
};

/**
 * Delete a folder and its frames
 * @param folderId The ID of the folder to delete
 */
export const deleteFolder = (folderId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    // Delete folder frames first
    const framesTransaction = db.transaction([FOLDER_FRAMES_STORE], 'readwrite');
    const framesStore = framesTransaction.objectStore(FOLDER_FRAMES_STORE);
    const framesIndex = framesStore.index('folder_id');
    const framesRequest = framesIndex.openCursor(IDBKeyRange.only(folderId));

    framesRequest.onerror = (event) => {
      console.error('Error deleting folder frames:', event);
      reject(new Error('Failed to delete folder frames'));
    };

    framesRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        // All frames deleted, now delete the folder
        const folderTransaction = db.transaction([FOLDERS_STORE], 'readwrite');
        const folderStore = folderTransaction.objectStore(FOLDERS_STORE);
        const folderRequest = folderStore.delete(folderId);

        folderRequest.onerror = (event) => {
          console.error('Error deleting folder:', event);
          reject(new Error('Failed to delete folder'));
        };

        folderRequest.onsuccess = () => {
          resolve();
        };
      }
    };
  });
};

/**
 * Helper functions for converting between SpriteSet and database format
 */
export const spriteToDatabaseFormat = (
  id: string,
  name: string | undefined,
  style: string,
  object: string,
  action: string,
  background: string,
  prompt: string | undefined
) => {
  return {
    id,
    name: name || '',
    style,
    object,
    action,
    background,
    prompt: prompt || '',
    created_at: new Date().toISOString()
  };
};

export const frameToDatabaseFormat = (
  spriteId: string,
  frameIndex: number,
  filename: string,
  imageData: string
) => {
  return {
    sprite_id: spriteId,
    frame_index: frameIndex,
    filename,
    image_data: imageData
  };
};

export const folderToDatabaseFormat = (
  id: string,
  name: string
) => {
  return {
    id,
    name,
    created_at: new Date().toISOString()
  };
};

export const folderFrameToDatabaseFormat = (
  folderId: string,
  frameData: string
) => {
  return {
    folder_id: folderId,
    frame_data: frameData
  };
};
