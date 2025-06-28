import React, { useCallback } from 'react';
import { motion } from 'framer-motion';

// Stage Component - Responsive
const Stage = ({ 
  sprites, 
  selectedSpriteId, 
  onSpriteSelect, 
  onSpriteMove, 
  onDrop,
  showDebugCircle = false 
}) => {
  const handleDragEnd = useCallback((event, info, spriteId) => {
    const rect = event.target.closest('.stage-container').getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 64, info.point.x - rect.left - 32));
    const y = Math.max(0, Math.min(rect.height - 64, info.point.y - rect.top - 32));
    onSpriteMove(spriteId, x, y);
  }, [onSpriteMove]);

  const getSpriteEmoji = (spriteName) => {
    switch (spriteName) {
      case 'Cat': return '🐱';
      case 'Dog': return '🐶';
      case 'Ball': return '⚽';
      default: return '❓';
    }
  };

  return (
    <div className="stage-container relative w-full h-full bg-gray-800 overflow-hidden rounded border border-green-600">
      {sprites.map((sprite) => (
        <div key={sprite.id} className="absolute">
          {/* Speech bubble */}
          {sprite.speech && (
            <div
              className="absolute z-20 bg-white text-black px-2 py-1 rounded-lg shadow-lg text-xs sm:text-sm font-medium whitespace-nowrap max-w-32 sm:max-w-48"
              style={{
                left: sprite.x + 32,
                top: sprite.y - 35,
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                transition: 'none'
              }}
            >
              {sprite.speech}
              <div 
                className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '4px solid white'
                }}
              />
            </div>
          )}

          {/* Sprite */}
          <motion.div
            drag
            dragMomentum={false}
            dragTransition={{ power: 0, timeConstant: 0 }}
            onDragEnd={(event, info) => handleDragEnd(event, info, sprite.id)}
            onClick={() => onSpriteSelect(sprite.id)}
            className={`absolute cursor-pointer select-none z-10 ${
              selectedSpriteId === sprite.id 
                ? 'ring-2 sm:ring-4 ring-green-400 ring-opacity-70' 
                : ''
            } ${sprite.hasCollided ? 'animate-pulse' : ''}`}
            style={{
              left: sprite.x,
              top: sprite.y,
              fontSize: `${sprite.size * 24}px`,
              transform: `rotate(${sprite.rotation}deg)`,
              opacity: sprite.visible ? 1 : 0.3,
              transition: 'opacity 0.2s ease'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gray-700 rounded-lg border-2 border-gray-600 hover:border-green-400 transition-colors">
              <span className="text-lg sm:text-2xl">
                {getSpriteEmoji(sprite.name)}
              </span>
            </div>
            
            {/* Coordinates display */}
            <div className="absolute -bottom-5 left-0 text-xs text-green-400 font-mono pointer-events-none hidden sm:block">
              ({Math.round(sprite.x)}, {Math.round(sprite.y)})
            </div>
          </motion.div>
        </div>
      ))}

      <div className="absolute bottom-1 right-1 text-xs text-gray-500 pointer-events-none hidden sm:block">
        🚧 Collision Zone Active
      </div>
    </div>
  );
};


export default Stage;