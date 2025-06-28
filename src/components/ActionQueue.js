'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { getActionLabel } from '../utils/spriteActions';

const ActionQueue = ({ 
  spriteActions, 
  selectedSpriteId, 
  sprites, 
  onRemoveAction, 
  onClearAllActions,
  isPlaying 
}) => {
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);
  const currentActions = spriteActions[selectedSpriteId] || [];

  if (!selectedSpriteId || !selectedSprite) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Action Queue</h3>
        <div className="text-center text-gray-500 py-8">
          Select a sprite to see its action queue
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-lg">
          Actions for {selectedSprite.name}
        </h3>
        {currentActions.length > 0 && (
          <button
            onClick={() => onClearAllActions(selectedSpriteId)}
            disabled={isPlaying}
            className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {currentActions.length === 0 ? (
          <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-lg">
            No actions queued. Click blocks to add actions.
          </div>
        ) : (
          currentActions.map((action, index) => (
            <motion.div
              key={`${action}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {getActionLabel(action)}
                </span>
              </div>
              <button
                onClick={() => onRemoveAction(selectedSpriteId, index)}
                disabled={isPlaying}
                className="text-red-500 hover:text-red-700 text-xs disabled:opacity-50"
              >
                ✕
              </button>
            </motion.div>
          ))
        )}
      </div>

      {currentActions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">
            <strong>{currentActions.length}</strong> action{currentActions.length !== 1 ? 's' : ''} queued
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Use Play button to execute all actions in sequence
          </p>
        </div>
      )}
    </div>
  );
};

export default ActionQueue;