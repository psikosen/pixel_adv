import React, { useState } from 'react';
import { AnimationFolder, exportFolderAsZip, deleteAnimationFolder, renameAnimationFolder } from '../../lib/api/folderService';

interface FolderManagerProps {
  folders: AnimationFolder[];
  onFoldersChange: (folders: AnimationFolder[]) => void;
  onSelectFolder: (folderId: string) => void;
  activeFolderId: string | null;
}

const FolderManager = ({
  folders,
  onFoldersChange,
  onSelectFolder,
  activeFolderId
}: FolderManagerProps) => {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  
  const handleRename = (id: string, currentName: string) => {
    setEditingFolderId(id);
    setNewFolderName(currentName);
  };
  
  const handleSaveRename = (id: string) => {
    if (newFolderName.trim()) {
      const updatedFolders = renameAnimationFolder(id, newFolderName);
      onFoldersChange(updatedFolders);
    }
    setEditingFolderId(null);
  };
  
  const handleDelete = (id: string) => {
    // Confirm deletion
    if (window.confirm('Are you sure you want to delete this folder?')) {
      const updatedFolders = deleteAnimationFolder(id);
      onFoldersChange(updatedFolders);
      
      // If the active folder was deleted, reset active folder
      if (activeFolderId === id) {
        onSelectFolder(updatedFolders.length > 0 ? updatedFolders[0].id : null);
      }
    }
  };
  
  const handleExport = async (id: string) => {
    try {
      await exportFolderAsZip(id);
    } catch (error) {
      console.error('Error exporting folder:', error);
      alert('Failed to export folder. Please try again.');
    }
  };

  return (
    <div className="panel h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Animation Folders</h2>
      </div>
      
      <div className="overflow-y-auto flex-1 mb-4">
        {folders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No animation folders yet. Generate frames to create one.
          </div>
        ) : (
          folders.map((folder) => (
            <div 
              key={folder.id}
              className={`frame-item ${activeFolderId === folder.id ? 'active' : ''}`}
              onClick={() => onSelectFolder(folder.id)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 flex items-center justify-center mr-3 bg-blue-100 rounded overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  {editingFolderId === folder.id ? (
                    <input
                      className="w-full px-2 py-1 border rounded"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onBlur={() => handleSaveRename(folder.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(folder.id)}
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="font-medium">{folder.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(folder.createdAt).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  className="text-gray-500 hover:text-gray-700 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(folder.id, folder.name);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-500 hover:text-green-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(folder.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v12"/>
                    <path d="m8 11 4 4 4-4"/>
                    <path d="M8 21H16"/>
                    <path d="M3 7v6a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-500 hover:text-red-500 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(folder.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        Animation folders help organize your generated frames
      </div>
    </div>
  );
};

export default FolderManager;
