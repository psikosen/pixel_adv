import React from 'react';

export interface SpriteSet {
  id: string;
  frames: string[];
  thumbnails: string[];
}

interface SpriteSetListProps {
  spriteSets: SpriteSet[];
  activeSpriteSet: string | null;
  onSelectSpriteSet: (id: string) => void;
  onDeleteSpriteSet: (id: string) => void;
}

const SpriteSetList = ({
  spriteSets,
  activeSpriteSet,
  onSelectSpriteSet,
  onDeleteSpriteSet
}: SpriteSetListProps) => {
  return (
    <div className="panel h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sprite Sets</h2>
      </div>
      <div className="overflow-y-auto flex-1">
        {spriteSets.map((spriteSet) => (
          <div 
            key={spriteSet.id}
            className={`sprite-set ${activeSpriteSet === spriteSet.id ? 'active' : ''}`}
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
            <div className="grid grid-cols-4 gap-1">
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
        ))}
      </div>
    </div>
  );
};

export default SpriteSetList;
