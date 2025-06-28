'use client';
import React from 'react';
import { motion } from 'framer-motion';

const LooksBlocks = ({ onBlockClick, selectedSpriteId, isPlaying }) => {
  const looksBlocks = [
    { id: 'say-hello', label: 'Say "Hello World!" 2s', color: 'bg-purple-500', action: 'sayHello' },
    { id: 'say-custom', label: 'Say "I\'m awesome!" 2s', color: 'bg-purple-500', action: 'sayCustom' },
    { id: 'hide', label: 'Hide sprite', color: 'bg-purple-600', action: 'hide' },
    { id: 'show', label: 'Show sprite', color: 'bg-purple-600', action: 'show' },
  ];

  const handleDragStart = (e, block) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'block',
      action: block.action,
      label: block.label
    }));
  };

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-purple-700 text-lg border-b-2 border-purple-200 pb-2">
        Looks Blocks
      </h3>
      {looksBlocks.map(block => (
        <motion.button
          key={block.id}
          onClick={() => selectedSpriteId && !isPlaying && onBlockClick(block.action, selectedSpriteId)}
          onDragStart={(e) => handleDragStart(e, block)}
          draggable
          disabled={!selectedSpriteId || isPlaying}
          className={`${block.color} ${
            selectedSpriteId && !isPlaying
              ? 'hover:opacity-90 cursor-pointer hover:shadow-lg' 
              : 'opacity-50 cursor-not-allowed'
          } text-white px-4 py-3 rounded-xl font-medium text-sm w-full text-left transition-all shadow-md`}
          whileHover={selectedSpriteId && !isPlaying ? { scale: 1.02, y: -1 } : {}}
          whileTap={selectedSpriteId && !isPlaying ? { scale: 0.98 } : {}}
        >
          {block.label}
        </motion.button>
      ))}
      
      {(!selectedSpriteId || isPlaying) && (
        <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
          {!selectedSpriteId ? 'Select a sprite to use looks blocks' : 'Cannot add actions while playing'}
        </div>
      )}
    </div>
  );
};

export default LooksBlocks;