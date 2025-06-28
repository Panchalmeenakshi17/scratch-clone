'use client';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const Sprite = ({ 
  sprite, 
  isSelected, 
  onSelect, 
  onMove, 
  showCoordinates = false,
  stageWidth = 600,
  stageHeight = 420
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const spriteRef = useRef(null);

  const getSpriteEmoji = (name) => {
    switch (name) {
      case 'Cat': return '🐱';
      case 'Dog': return '🐶';
      case 'Ball': return '⚽';
      default: return '🔲';
    }
  };

  const getSpriteSize = () => {
    const baseSize = 50;
    return baseSize * (sprite.size || 1);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSelect) {
      onSelect();
    }
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - sprite.x,
      y: e.clientY - sprite.y
    });

    const handleMouseMove = (e) => {
      if (onMove) {
        const rect = document.querySelector('.relative.w-full.h-full.bg-gray-800')?.getBoundingClientRect();
        if (rect) {
          const scaleX = stageWidth / rect.width;
          const scaleY = stageHeight / rect.height;
          const newX = (e.clientX - rect.left) * scaleX;
          const newY = (e.clientY - rect.top) * scaleY;
          onMove(newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const spriteStyle = {
    position: 'absolute',
    left: `${(sprite.x / stageWidth) * 100}%`,
    top: `${(sprite.y / stageHeight) * 100}%`,
    width: getSpriteSize(),
    height: getSpriteSize(),
    transform: `translate(-50%, -50%) rotate(${sprite.rotation || 0}deg)`,
    opacity: sprite.visible ? 1 : 0.3,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isSelected ? 10 : 1,
  };

  return (
    <>
      {/* Main Sprite */}
      <motion.div
        ref={spriteRef}
        style={spriteStyle}
        className={`
          flex items-center justify-center text-4xl select-none rounded-lg
          ${isSelected ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-800' : ''}
          ${sprite.hasCollided ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-gray-800' : ''}
        `}
        onMouseDown={handleMouseDown}
        animate={{
          scale: sprite.hasCollided ? [1, 1.2, 1] : 1,
        }}
        transition={{
          scale: { duration: 0.3 }
        }}
      >
        {getSpriteEmoji(sprite.name)}
        
        {/* Coordinate display overlay */}
        {(showCoordinates || isSelected) && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-green-400 px-1 py-0.5 rounded text-xs font-mono whitespace-nowrap">
            ({Math.round(sprite.x)}, {Math.round(sprite.y)})
          </div>
        )}
        
        {/* Size indicator */}
        {sprite.size !== 1 && (
          <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-xs px-1 rounded-full">
            {sprite.size.toFixed(1)}×
          </div>
        )}
      </motion.div>

      {/* Speech bubble */}
      {sprite.speech && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          style={{
            position: 'absolute',
            left: sprite.x - 60,
            top: sprite.y - getSpriteSize() / 2 - 40,
            zIndex: 20,
          }}
          className="bg-white text-black px-3 py-2 rounded-lg text-sm max-w-32 text-center relative"
        >
          {sprite.speech}
          {/* Speech bubble tail */}
          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
        </motion.div>
      )}

      {/* Collision detection radius visualization (when debugging) */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            left: sprite.x - ((sprite.size || 1) * 25),
            top: sprite.y - ((sprite.size || 1) * 25),
            width: (sprite.size || 1) * 50,
            height: (sprite.size || 1) * 50,
            border: '2px dashed rgba(239, 68, 68, 0.5)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* Movement trail (optional visual enhancement) */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            left: sprite.x - 2,
            top: sprite.y - 2,
            width: 4,
            height: 4,
            backgroundColor: '#10b981',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
    </>
  );
};

export default Sprite;