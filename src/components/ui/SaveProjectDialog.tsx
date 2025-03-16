import React, { useState } from 'react';

interface SaveProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (filename: string) => void;
  defaultFilename?: string;
}

const SaveProjectDialog = ({
  isOpen,
  onClose,
  onSave,
  defaultFilename = 'pixel_adventure_project.json'
}: SaveProjectDialogProps) => {
  const [filename, setFilename] = useState(defaultFilename);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(filename);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Save Project</h2>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filename
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="text-sm text-gray-500">
              Your project will be saved as a JSON file that can be imported later.
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveProjectDialog;
