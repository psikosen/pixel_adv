import React, { useState } from 'react';
import { SpriteSet, saveSpriteSetsToStorage } from '../../lib/animation/frameManager';

interface SpriteManagerProps {
  spriteSets: SpriteSet[];
  activeSpriteSetId: string | null;
  onSelectSpriteSet: (id: string) => void;
  onDeleteSpriteSet: (id: string) => void;
  onCreateSpriteSet: () => void;
}

const SpriteManager = ({
  spriteSets,
  activeSpriteSetId,
  onSelectSpriteSet,
  onDeleteSpriteSet,
  onCreateSpriteSet
}: SpriteManagerProps) => {
  const [filterText, setFilterText] = useState('');

  const filteredSpriteSets = filterText
    ? spriteSets.filter(set => 
        set.id.toLowerCase().includes(filterText.toLowerCase()) ||
        (set.metadata?.object?.toLowerCase().includes(filterText.toLowerCase())) ||
        (set.metadata?.action?.toLowerCase().includes(filterText.toLowerCase()))
      )
    : spriteSets;

  return (
    <div className="panel h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sprite Sets</h2>
        <button
          className="btn btn-secondary flex items-center"
          onClick={onCreateSpriteSet}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Set
        </button>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search sprite sets..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      
      <div className="overflow-y-auto flex-1">
        {filteredSpriteSets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {filterText ? 'No matching sprite sets found.' : 'No sprite sets available. Create a new set to get started.'}
          </div>
        ) : (
          filteredSpriteSets.map((spriteSet) => (
            <div 
              key={spriteSet.id}
              className={`sprite-set ${activeSpriteSetId === spriteSet.id ? 'active' : ''}`}
              onClick={() => onSelectSpriteSet(spriteSet.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Set: {spriteSet.id}</span>
                <button 
                  className="text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSpriteSet(spriteSet.id);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              
              {spriteSet.metadata && (
                <div className="text-xs text-gray-500 mb-2">
                  {spriteSet.metadata.style} {spriteSet.metadata.object} {spriteSet.metadata.action}
                </div>
              )}
              
              <div className="grid grid-cols-4 gap-1 relative">
                {spriteSet.thumbnails.slice(0, 4).map((thumbnail, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={thumbnail} 
                      alt={`Frame ${index + 1}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
                {spriteSet.thumbnails.length > 4 && (
                  <div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs px-1 rounded">
                    +{spriteSet.thumbnails.length - 4}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4">
        <button 
          className="btn btn-primary w-full"
          onClick={() => {
            saveSpriteSetsToStorage(spriteSets);
            alert('All sprite sets saved successfully!');
          }}
          disabled={spriteSets.length === 0}
        >
          Save All Sprite Sets
        </button>
      </div>
    </div>
  );
};

export default SpriteManager;
