import React, { useState, useRef } from 'react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProject: (file: File) => void;
  onImportImage: (file: File) => void;
}

const ImportDialog = ({
  isOpen,
  onClose,
  onImportProject,
  onImportImage
}: ImportDialogProps) => {
  const [activeTab, setActiveTab] = useState<'project' | 'image'>('project');
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImportProject(files[0]);
      onClose();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImportImage(files[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Import</h2>
        </div>
        
        <div className="p-4">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 ${activeTab === 'project' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('project')}
            >
              Project
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'image' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('image')}
            >
              Image
            </button>
          </div>
          
          {activeTab === 'project' ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-700 mb-4">
                Import a previously saved Pixel Adventure project file (.json)
              </div>
              
              <input
                type="file"
                ref={projectFileInputRef}
                onChange={handleProjectFileChange}
                accept=".json"
                className="hidden"
              />
              
              <button
                className="btn btn-primary w-full"
                onClick={() => projectFileInputRef.current?.click()}
              >
                Select Project File
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-700 mb-4">
                Import an image to add as a new frame (.png, .jpg, .gif)
              </div>
              
              <input
                type="file"
                ref={imageFileInputRef}
                onChange={handleImageFileChange}
                accept="image/png,image/jpeg,image/gif"
                className="hidden"
              />
              
              <button
                className="btn btn-primary w-full"
                onClick={() => imageFileInputRef.current?.click()}
              >
                Select Image File
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportDialog;
