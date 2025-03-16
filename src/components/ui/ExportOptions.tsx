import React, { useState } from 'react';

interface ExportOptionsProps {
  onExportGif: () => void;
  onExportSpriteSheet: () => void;
  onSaveProject: () => void;
  disabled: boolean;
  isExporting?: boolean;
  isSaving?: boolean;
}

const ExportOptions = ({
  onExportGif,
  onExportSpriteSheet,
  onSaveProject,
  disabled,
  isExporting = false,
  isSaving = false
}: ExportOptionsProps) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex justify-between">
        <button
          className="btn btn-primary"
          onClick={() => setShowOptions(!showOptions)}
          disabled={disabled || isExporting || isSaving}
        >
          Export Options
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-2"
          >
            {showOptions ? (
              <polyline points="18 15 12 9 6 15"></polyline>
            ) : (
              <polyline points="6 9 12 15 18 9"></polyline>
            )}
          </svg>
        </button>
      </div>

      {showOptions && (
        <div className="mt-2 space-y-2 p-3 border border-gray-200 rounded-md">
          <button
            className="btn btn-secondary w-full flex items-center justify-center"
            onClick={onExportGif}
            disabled={disabled || isExporting || isSaving}
          >
            {isExporting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
                Exporting GIF...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                Export as GIF
              </>
            )}
          </button>

          <button
            className="btn btn-secondary w-full flex items-center justify-center"
            onClick={onExportSpriteSheet}
            disabled={disabled || isExporting || isSaving}
          >
            {isExporting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
                Exporting Sprite Sheet...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="3" y1="15" x2="21" y2="15"></line>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
                Export as Sprite Sheet
              </>
            )}
          </button>

          <button
            className="btn btn-secondary w-full flex items-center justify-center"
            onClick={onSaveProject}
            disabled={disabled || isExporting || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
                Saving Project...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Project
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportOptions;
