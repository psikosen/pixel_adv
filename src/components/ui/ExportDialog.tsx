import React, { useState } from 'react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExportGif: (options: GifExportOptions) => void;
  onExportSpriteSheet: (options: SpriteSheetExportOptions) => void;
  frameCount: number;
}

export interface GifExportOptions {
  filename: string;
  fps: number;
  loop: boolean;
}

export interface SpriteSheetExportOptions {
  filename: string;
  columns: number;
  padding: number;
  includeMetadata: boolean;
}

const ExportDialog = ({
  isOpen,
  onClose,
  onExportGif,
  onExportSpriteSheet,
  frameCount
}: ExportDialogProps) => {
  const [activeTab, setActiveTab] = useState<'gif' | 'spritesheet'>('gif');
  
  // GIF export options
  const [gifFilename, setGifFilename] = useState('pixel_adventure.gif');
  const [gifFps, setGifFps] = useState(12);
  const [gifLoop, setGifLoop] = useState(true);
  
  // Sprite sheet export options
  const [sheetFilename, setSheetFilename] = useState('pixel_adventure_spritesheet.png');
  const [sheetColumns, setSheetColumns] = useState(4);
  const [sheetPadding, setSheetPadding] = useState(0);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  if (!isOpen) return null;

  const handleExportGif = () => {
    onExportGif({
      filename: gifFilename,
      fps: gifFps,
      loop: gifLoop
    });
    onClose();
  };

  const handleExportSpriteSheet = () => {
    onExportSpriteSheet({
      filename: sheetFilename,
      columns: sheetColumns,
      padding: sheetPadding,
      includeMetadata: includeMetadata
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Export Options</h2>
        </div>
        
        <div className="p-4">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 ${activeTab === 'gif' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('gif')}
            >
              Animated GIF
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'spritesheet' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('spritesheet')}
            >
              Sprite Sheet
            </button>
          </div>
          
          {activeTab === 'gif' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filename
                </label>
                <input
                  type="text"
                  value={gifFilename}
                  onChange={(e) => setGifFilename(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frames Per Second (FPS)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={gifFps}
                    onChange={(e) => setGifFps(parseInt(e.target.value))}
                    className="slider flex-1 mr-2"
                  />
                  <span className="text-sm w-8 text-center">{gifFps}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gifLoop"
                  checked={gifLoop}
                  onChange={(e) => setGifLoop(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="gifLoop" className="text-sm font-medium text-gray-700">
                  Loop animation
                </label>
              </div>
              
              <div className="text-sm text-gray-500">
                {frameCount} frames will be exported.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filename
                </label>
                <input
                  type="text"
                  value={sheetFilename}
                  onChange={(e) => setSheetFilename(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Columns
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sheetColumns}
                    onChange={(e) => setSheetColumns(parseInt(e.target.value))}
                    className="slider flex-1 mr-2"
                  />
                  <span className="text-sm w-8 text-center">{sheetColumns}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Padding (pixels)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={sheetPadding}
                    onChange={(e) => setSheetPadding(parseInt(e.target.value))}
                    className="slider flex-1 mr-2"
                  />
                  <span className="text-sm w-8 text-center">{sheetPadding}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeMetadata"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="includeMetadata" className="text-sm font-medium text-gray-700">
                  Include metadata file (JSON)
                </label>
              </div>
              
              <div className="text-sm text-gray-500">
                {frameCount} frames will be arranged in {Math.ceil(frameCount / sheetColumns)} rows.
              </div>
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
          <button
            className="btn btn-primary"
            onClick={activeTab === 'gif' ? handleExportGif : handleExportSpriteSheet}
            disabled={frameCount === 0}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
