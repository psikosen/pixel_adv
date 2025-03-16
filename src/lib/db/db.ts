import sqlite3 from 'sql.js';

let db: any = null;
let SQL: any = null;

/**
 * Initialize the database
 */
export const initDatabase = async (): Promise<void> => {
  try {
    if (!SQL) {
      SQL = await sqlite3({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
    }
    
    // Create a new database
    db = new SQL.Database();
    
    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS sprites (
        id TEXT PRIMARY KEY,
        name TEXT,
        style TEXT,
        object TEXT,
        action TEXT,
        background TEXT,
        prompt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS frames (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sprite_id TEXT,
        frame_index INTEGER,
        filename TEXT,
        image_data TEXT,
        FOREIGN KEY (sprite_id) REFERENCES sprites(id)
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS folder_frames (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        folder_id TEXT,
        frame_data TEXT,
        FOREIGN KEY (folder_id) REFERENCES folders(id)
      )
    `);
    
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Check if database is initialized
 */
export const isDatabaseInitialized = (): boolean => {
  return db !== null;
};

/**
 * Get the database instance
 */
export const getDatabase = (): any => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

/**
 * Save a sprite set to the database
 * @param spriteSet The sprite set to save
 * @returns The ID of the saved sprite set
 */
export const saveSpriteSet = (
  id: string,
  name: string | undefined,
  style: string,
  object: string,
  action: string,
  background: string,
  prompt: string | undefined
): string => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  // Check if sprite set exists
  const existing = db.exec(`SELECT id FROM sprites WHERE id = '${id}'`);
  
  if (existing.length > 0) {
    // Update existing sprite set
    db.run(`
      UPDATE sprites
      SET 
        name = ?,
        style = ?,
        object = ?,
        action = ?,
        background = ?,
        prompt = ?
      WHERE id = ?
    `, [name || '', style, object, action, background, prompt || '', id]);
  } else {
    // Insert new sprite set
    db.run(`
      INSERT INTO sprites (id, name, style, object, action, background, prompt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, name || '', style, object, action, background, prompt || '']);
  }
  
  return id;
};

/**
 * Save a frame to the database
 * @param spriteId The ID of the sprite set
 * @param frameIndex The index of the frame
 * @param filename The filename of the frame
 * @param imageData The image data (as base64 string)
 */
export const saveFrame = (
  spriteId: string,
  frameIndex: number,
  filename: string,
  imageData: string
): void => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  // Check if frame exists
  const existing = db.exec(`
    SELECT id FROM frames 
    WHERE sprite_id = '${spriteId}' AND frame_index = ${frameIndex}
  `);
  
  if (existing.length > 0) {
    // Update existing frame
    db.run(`
      UPDATE frames
      SET filename = ?, image_data = ?
      WHERE sprite_id = ? AND frame_index = ?
    `, [filename, imageData, spriteId, frameIndex]);
  } else {
    // Insert new frame
    db.run(`
      INSERT INTO frames (sprite_id, frame_index, filename, image_data)
      VALUES (?, ?, ?, ?)
    `, [spriteId, frameIndex, filename, imageData]);
  }
};

/**
 * Get all sprite sets from the database
 * @returns Array of sprite sets
 */
export const getAllSpriteSets = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const result = db.exec(`
    SELECT id, name, style, object, action, background, prompt, created_at
    FROM sprites
    ORDER BY created_at DESC
  `);
  
  if (!result.length) {
    return [];
  }
  
  const columns = result[0].columns;
  return result[0].values.map((row: any) => {
    const spriteSet: any = {};
    columns.forEach((col: string, index: number) => {
      spriteSet[col] = row[index];
    });
    return spriteSet;
  });
};

/**
 * Get frames for a sprite set
 * @param spriteId The ID of the sprite set
 * @returns Array of frames
 */
export const getFramesForSpriteSet = (spriteId: string) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const result = db.exec(`
    SELECT id, frame_index, filename, image_data
    FROM frames
    WHERE sprite_id = '${spriteId}'
    ORDER BY frame_index
  `);
  
  if (!result.length) {
    return [];
  }
  
  const columns = result[0].columns;
  return result[0].values.map((row: any) => {
    const frame: any = {};
    columns.forEach((col: string, index: number) => {
      frame[col] = row[index];
    });
    return frame;
  });
};

/**
 * Save a folder to the database
 * @param id The ID of the folder
 * @param name The name of the folder
 * @returns The ID of the saved folder
 */
export const saveFolder = (id: string, name: string): string => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  // Check if folder exists
  const existing = db.exec(`SELECT id FROM folders WHERE id = '${id}'`);
  
  if (existing.length > 0) {
    // Update existing folder
    db.run(`
      UPDATE folders
      SET name = ?
      WHERE id = ?
    `, [name, id]);
  } else {
    // Insert new folder
    db.run(`
      INSERT INTO folders (id, name)
      VALUES (?, ?)
    `, [id, name]);
  }
  
  return id;
};

/**
 * Save frames to a folder
 * @param folderId The ID of the folder
 * @param frameData The frame data
 */
export const saveFolderFrames = (folderId: string, frameData: string): void => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  db.run(`
    INSERT INTO folder_frames (folder_id, frame_data)
    VALUES (?, ?)
  `, [folderId, frameData]);
};

/**
 * Get all folders from the database
 * @returns Array of folders
 */
export const getAllFolders = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const result = db.exec(`
    SELECT id, name, created_at
    FROM folders
    ORDER BY created_at DESC
  `);
  
  if (!result.length) {
    return [];
  }
  
  const columns = result[0].columns;
  return result[0].values.map((row: any) => {
    const folder: any = {};
    columns.forEach((col: string, index: number) => {
      folder[col] = row[index];
    });
    return folder;
  });
};

/**
 * Get frames for a folder
 * @param folderId The ID of the folder
 * @returns Array of frame data
 */
export const getFramesForFolder = (folderId: string) => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const result = db.exec(`
    SELECT id, frame_data
    FROM folder_frames
    WHERE folder_id = '${folderId}'
  `);
  
  if (!result.length) {
    return [];
  }
  
  const columns = result[0].columns;
  return result[0].values.map((row: any) => {
    const frame: any = {};
    columns.forEach((col: string, index: number) => {
      frame[col] = row[index];
    });
    return frame;
  });
};

/**
 * Delete a sprite set and its frames
 * @param spriteId The ID of the sprite set to delete
 */
export const deleteSpriteSet = (spriteId: string): void => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  // Delete frames first (due to foreign key constraint)
  db.run(`DELETE FROM frames WHERE sprite_id = ?`, [spriteId]);
  
  // Delete sprite set
  db.run(`DELETE FROM sprites WHERE id = ?`, [spriteId]);
};

/**
 * Delete a folder and its frames
 * @param folderId The ID of the folder to delete
 */
export const deleteFolder = (folderId: string): void => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  // Delete frames first
  db.run(`DELETE FROM folder_frames WHERE folder_id = ?`, [folderId]);
  
  // Delete folder
  db.run(`DELETE FROM folders WHERE id = ?`, [folderId]);
};

/**
 * Export the database as a Uint8Array
 * @returns Uint8Array containing the database
 */
export const exportDatabase = (): Uint8Array => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  return db.export();
};

/**
 * Import a database from a Uint8Array
 * @param data Uint8Array containing the database
 */
export const importDatabase = (data: Uint8Array): void => {
  if (!SQL) {
    throw new Error('SQL.js not initialized');
  }
  
  db = new SQL.Database(data);
};
