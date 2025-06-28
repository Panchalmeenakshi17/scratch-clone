'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Static Animals List
const ANIMALS_LIST = {
  'Cat': '🐱',
  'Dog': '🐶', 
  'Lion': '🦁',
  'Tiger': '🐅',
  'Bear': '🐻',
  'Fox': '🦊',
  'Wolf': '🐺',
  'Panda': '🐼',
  'Monkey': '🐵',
  'Elephant': '🐘'
};

// Enhanced Sprite Actions Implementation with Repeat
const spriteActions = {
  // Motion actions
  moveSteps: (steps) => ({ type: 'moveSteps', steps }),
  turnDegrees: (degrees) => ({ type: 'turnDegrees', degrees }),
  goToXY: (x, y) => ({ type: 'goToXY', x, y }),
  repeat: (actions, times) => ({ type: 'repeat', actions, times }),
  
  // Looks actions
  sayFor: (text, seconds) => ({ type: 'sayFor', text, seconds }),
  thinkFor: (text, seconds) => ({ type: 'thinkFor', text, seconds }),
  
  // Predefined actions for easy use
  moveRight: { type: 'moveSteps', steps: 30 },
  moveLeft: { type: 'moveSteps', steps: -30 },
  moveUp: { type: 'moveSteps', steps: 30, direction: 'up' },
  moveDown: { type: 'moveSteps', steps: 30, direction: 'down' },
  spin360: { type: 'turnDegrees', degrees: 360 },
  sayHello: { type: 'sayFor', text: 'Hello!', seconds: 2 },
  thinkHmm: { type: 'thinkFor', text: 'Hmm...', seconds: 2 }
};

const executeAction = async (sprite, action, setSprites, stageWidth, stageHeight) => {
  return new Promise((resolve) => {
    if (typeof action === 'string') {
      action = spriteActions[action];
    }

    switch (action.type) {
      case 'repeat':
        // Handle repeat action by executing nested actions multiple times
        const executeRepeat = async () => {
          for (let i = 0; i < action.times; i++) {
            for (const nestedAction of action.actions) {
              await executeAction(sprite, nestedAction, setSprites, stageWidth, stageHeight);
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          resolve();
        };
        executeRepeat();
        break;
        
      case 'moveSteps':
        setSprites(prevSprites => 
          prevSprites.map(s => {
            if (s.id === sprite.id) {
              const radians = (s.rotation * Math.PI) / 180;
              let newX = s.x;
              let newY = s.y;
              
              if (action.direction === 'up') {
                newY = Math.max(30, Math.min(stageHeight - 30, s.y - action.steps));
              } else if (action.direction === 'down') {
                newY = Math.max(30, Math.min(stageHeight - 30, s.y + action.steps));
              } else {
                newX = Math.max(30, Math.min(stageWidth - 30, s.x + action.steps * Math.cos(radians)));
                newY = Math.max(30, Math.min(stageHeight - 30, s.y + action.steps * Math.sin(radians)));
              }
              
              return { ...s, x: newX, y: newY };
            }
            return s;
          })
        );
        setTimeout(resolve, 500);
        break;
        
      case 'turnDegrees':
        setSprites(prevSprites => 
          prevSprites.map(s => 
            s.id === sprite.id 
              ? { ...s, rotation: s.rotation + action.degrees }
              : s
          )
        );
        setTimeout(resolve, 300);
        break;
        
      case 'goToXY':
        setSprites(prevSprites => 
          prevSprites.map(s => 
            s.id === sprite.id 
              ? { ...s, x: Math.max(30, Math.min(stageWidth - 30, action.x)), y: Math.max(30, Math.min(stageHeight - 30, action.y)) }
              : s
          )
        );
        setTimeout(resolve, 500);
        break;
        
      case 'sayFor':
        setSprites(prevSprites => 
          prevSprites.map(s => 
            s.id === sprite.id 
              ? { ...s, speech: action.text, speechType: 'say' }
              : s
          )
        );
        setTimeout(() => {
          setSprites(prevSprites => 
            prevSprites.map(s => 
              s.id === sprite.id 
                ? { ...s, speech: '', speechType: '' }
                : s
            )
          );
          resolve();
        }, action.seconds * 1000);
        break;
        
      case 'thinkFor':
        setSprites(prevSprites => 
          prevSprites.map(s => 
            s.id === sprite.id 
              ? { ...s, speech: action.text, speechType: 'think' }
              : s
          )
        );
        setTimeout(() => {
          setSprites(prevSprites => 
            prevSprites.map(s => 
              s.id === sprite.id 
                ? { ...s, speech: '', speechType: '' }
                : s
            )
          );
          resolve();
        }, action.seconds * 1000);
        break;
        
      default:
        resolve();
    }
  });
};

// Draggable Block Component
const DraggableBlock = ({ block, isPlaying, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: { 
      blockData: block,
      id: `${block.id}-${Date.now()}`
    },
    canDrag: !isPlaying,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [block, isPlaying]);

  return (
    <div
      ref={drag}
      className={`${isDragging ? 'opacity-50' : 'opacity-100'} ${
        isPlaying ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {children}
    </div>
  );
};

// Dropped Action Block Component with Enhanced Repeat Display
const DroppedActionBlock = ({ action, index, onRemove, isPlaying }) => {
  const getActionDisplay = (action) => {
    if (typeof action === 'string') {
      return action;
    }
    switch (action.type) {
      case 'moveSteps':
        return `Move ${action.steps} steps${action.direction ? ` ${action.direction}` : ''}`;
      case 'turnDegrees':
        return `Turn ${action.degrees}°`;
      case 'goToXY':
        return `Go to (${action.x}, ${action.y})`;
      case 'sayFor':
        return `Say "${action.text}" for ${action.seconds}s`;
      case 'thinkFor':
        return `Think "${action.text}" for ${action.seconds}s`;
      case 'repeat':
        return `Repeat ${action.times} times (${action.actions.length} actions)`;
      default:
        return JSON.stringify(action);
    }
  };

  const getBlockColor = (action) => {
    if (typeof action === 'string') {
      if (['moveRight', 'moveLeft', 'moveUp', 'moveDown', 'spin360'].includes(action)) {
        return 'from-blue-500 to-indigo-600';
      }
      if (['sayHello', 'thinkHmm'].includes(action)) {
        return 'from-purple-500 to-pink-600';
      }
    }
    switch (action.type) {
      case 'moveSteps':
      case 'turnDegrees':
      case 'goToXY':
        return 'from-blue-500 to-indigo-600';
      case 'sayFor':
      case 'thinkFor':
        return 'from-purple-500 to-pink-600';
      case 'repeat':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.8 }}
      className={`bg-gradient-to-r ${getBlockColor(action)} text-white px-5 py-4 rounded-2xl text-sm font-medium flex items-center justify-between shadow-lg mb-3 border border-white/20 backdrop-blur-sm`}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className="text-xs bg-white/20 rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-sm"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          {index + 1}
        </motion.div>
        <div className="flex flex-col">
          <span className="drop-shadow-sm">{getActionDisplay(action)}</span>
          {action.type === 'repeat' && (
            <div className="text-xs opacity-80 mt-1">
              {action.actions.map((subAction, i) => (
                <div key={i} className="ml-2">
                  • {getActionDisplay(subAction)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <motion.button
        onClick={() => onRemove(index)}
        disabled={isPlaying}
        className="text-white/80 hover:text-red-200 disabled:opacity-50 text-lg leading-none ml-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/20 transition-all"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
      >
        ×
      </motion.button>
    </motion.div>
  );
};

// Enhanced Motion Blocks Component with Repeat
const MotionBlocks = ({ isPlaying }) => {
  const [customSteps, setCustomSteps] = useState(10);
  const [customDegrees, setCustomDegrees] = useState(90);
  const [customX, setCustomX] = useState(100);
  const [customY, setCustomY] = useState(100);
  const [repeatTimes, setRepeatTimes] = useState(3);

  const motionBlocks = [
    {
      id: 'moveSteps',
      label: 'move',
      subLabel: 'steps',
      gradient: 'from-blue-500 to-cyan-500',
      icon: '🚀',
      action: { type: 'moveSteps', steps: customSteps },
      customInput: (
        <input
          type="number"
          value={customSteps}
          onChange={(e) => setCustomSteps(parseInt(e.target.value) || 0)}
          className="w-14 text-xs bg-white/90 border border-blue-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
          disabled={isPlaying}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      id: 'turnDegrees',
      label: 'turn',
      subLabel: 'degrees',
      gradient: 'from-blue-500 to-indigo-600',
      icon: '🌀',
      action: { type: 'turnDegrees', degrees: customDegrees },
      customInput: (
        <input
          type="number"
          value={customDegrees}
          onChange={(e) => setCustomDegrees(parseInt(e.target.value) || 0)}
          className="w-14 text-xs bg-white/90 border border-blue-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 backdrop-blur-sm"
          disabled={isPlaying}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    {
      id: 'goToXY',
      label: 'go to',
      subLabel: 'coordinates',
      gradient: 'from-blue-600 to-purple-600',
      icon: '🎯',
      action: { type: 'goToXY', x: customX, y: customY },
      customInput: (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            value={customX}
            onChange={(e) => setCustomX(parseInt(e.target.value) || 0)}
            className="w-12 text-xs bg-white/90 border border-blue-200 rounded-lg px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={isPlaying}
            placeholder="X"
          />
          <input
            type="number"
            value={customY}
            onChange={(e) => setCustomY(parseInt(e.target.value) || 0)}
            className="w-12 text-xs bg-white/90 border border-blue-200 rounded-lg px-1 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={isPlaying}
            placeholder="Y"
          />
        </div>
      )
    },
    {
      id: 'repeat',
      label: 'repeat',
      subLabel: 'times (last 2 actions)',
      gradient: 'from-orange-500 to-red-600',
      icon: '🔄',
      action: { type: 'repeat', times: repeatTimes, actions: [] },
      customInput: (
        <input
          type="number"
          value={repeatTimes}
          onChange={(e) => setRepeatTimes(parseInt(e.target.value) || 1)}
          className="w-14 text-xs bg-white/90 border border-orange-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 backdrop-blur-sm"
          disabled={isPlaying}
          onClick={(e) => e.stopPropagation()}
          min="1"
        />
      )
    }
  ];

  return (
    <div className="space-y-3">
      {motionBlocks.map((block, index) => (
        <DraggableBlock key={block.id} block={block} isPlaying={isPlaying}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-gradient-to-r ${block.gradient} ${
              isPlaying ? 'opacity-50' : 'hover:shadow-xl active:scale-95'
            } text-white px-4 py-3 rounded-2xl text-sm font-medium w-full transition-all duration-300 flex items-center gap-3 shadow-lg border border-white/20 backdrop-blur-sm`}
            whileHover={isPlaying ? {} : { scale: 1.02, y: -2 }}
            whileTap={isPlaying ? {} : { scale: 0.98 }}
          >
            <span className="text-lg">{block.icon}</span>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="drop-shadow-sm">{block.label}</span>
                {block.customInput}
                {block.subLabel && <span className="text-xs opacity-90 drop-shadow-sm">{block.subLabel}</span>}
              </div>
            </div>
          </motion.div>
        </DraggableBlock>
      ))}
    </div>
  );
};

// Looks Blocks Component
const LooksBlocks = ({ isPlaying }) => {
  const [sayText, setSayText] = useState('Hello!');
  const [saySeconds, setSaySeconds] = useState(2);
  const [thinkText, setThinkText] = useState('Hmm...');
  const [thinkSeconds, setThinkSeconds] = useState(2);

  const looksBlocks = [
    {
      id: 'sayFor',
      label: 'say',
      gradient: 'from-purple-500 to-pink-600',
      icon: '💬',
      action: { type: 'sayFor', text: sayText, seconds: saySeconds },
      customInput: (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={sayText}
            onChange={(e) => setSayText(e.target.value)}
            className="w-20 text-xs bg-white/90 border border-purple-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
            disabled={isPlaying}
            placeholder="text"
          />
          <span className="text-xs opacity-80">for</span>
          <input
            type="number"
            value={saySeconds}
            onChange={(e) => setSaySeconds(parseFloat(e.target.value) || 1)}
            className="w-12 text-xs bg-white/90 border border-purple-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
            disabled={isPlaying}
            min="0.1"
            step="0.1"
          />
          <span className="text-xs opacity-80">sec</span>
        </div>
      )
    },
    {
      id: 'thinkFor',
      label: 'think',
      gradient: 'from-indigo-500 to-purple-600',
      icon: '💭',
      action: { type: 'thinkFor', text: thinkText, seconds: thinkSeconds },
      customInput: (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={thinkText}
            onChange={(e) => setThinkText(e.target.value)}
            className="w-20 text-xs bg-white/90 border border-purple-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 backdrop-blur-sm"
            disabled={isPlaying}
            placeholder="text"
          />
          <span className="text-xs opacity-80">for</span>
          <input
            type="number"
            value={thinkSeconds}
            onChange={(e) => setThinkSeconds(parseFloat(e.target.value) || 1)}
            className="w-12 text-xs bg-white/90 border border-purple-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
            disabled={isPlaying}
            min="0.1"
            step="0.1"
          />
          <span className="text-xs opacity-80">sec</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-3">
      {looksBlocks.map((block, index) => (
        <DraggableBlock key={block.id} block={block} isPlaying={isPlaying}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-gradient-to-r ${block.gradient} ${
              isPlaying ? 'opacity-50' : 'hover:shadow-xl active:scale-95'
            } text-white px-4 py-3 rounded-2xl text-sm font-medium w-full transition-all duration-300 flex items-center gap-3 shadow-lg border border-white/20 backdrop-blur-sm`}
            whileHover={isPlaying ? {} : { scale: 1.02, y: -2 }}
            whileTap={isPlaying ? {} : { scale: 0.98 }}
          >
            <span className="text-lg">{block.icon}</span>
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="drop-shadow-sm">{block.label}</span>
                {block.customInput}
              </div>
            </div>
          </motion.div>
        </DraggableBlock>
      ))}
    </div>
  );
};

// Enhanced Code Area with Repeat Support
const CodeArea = ({ spriteActions, selectedSpriteId, sprites, onAddAction, onRemoveAction, onClearAllActions, isPlaying }) => {
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);
  const actions = spriteActions[selectedSpriteId] || [];

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item) => {
      if (selectedSpriteId && item.blockData) {
        let actionToAdd = item.blockData.action;
        
        // Handle repeat block special case
        if (actionToAdd.type === 'repeat') {
          const lastTwoActions = actions.slice(-2);
          actionToAdd = {
            ...actionToAdd,
            actions: lastTwoActions
          };
        }
        
        onAddAction(actionToAdd, selectedSpriteId);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [selectedSpriteId, onAddAction, actions]);

  if (!selectedSpriteId) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-8xl mb-6"
        >
          🎯
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          Select a Sprite to Start Coding
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500"
        >
          Choose a sprite from the library to begin your creative journey
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h4 
          className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Code for {selectedSprite?.name}
        </motion.h4>
        {actions.length > 0 && (
          <motion.button
            onClick={() => onClearAllActions(selectedSpriteId)}
            disabled={isPlaying}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Clear All
          </motion.button>
        )}
      </div>
      
      <div
        ref={drop}
        className={`min-h-96 p-8 rounded-3xl border-2 border-dashed transition-all duration-300 ${
          isOver 
            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl scale-105' 
            : actions.length === 0
              ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50'
              : 'border-gray-200 bg-gradient-to-br from-white to-blue-50 shadow-lg'
        }`}
      >
        {actions.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-gray-400 py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="text-8xl mb-6"
              animate={{ 
                rotate: [0, -10, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              📝
            </motion.div>
            <motion.div 
              className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Drag Blocks Here to Code
            </motion.div>
            <motion.div 
              className="text-lg text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Create amazing animations by combining motion and looks blocks
              <br />
              <span className="text-orange-500 font-semibold">Try the Repeat block to loop your last 2 actions!</span>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <motion.div 
              className="text-lg text-gray-600 mb-6 font-medium flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {actions.length}
              </span>
              <span>action{actions.length !== 1 ? 's' : ''} queued for execution</span>
            </motion.div>
            <AnimatePresence>
              {actions.map((action, index) => (
                <DroppedActionBlock
                  key={`${index}-${JSON.stringify(action)}`}
                  action={action}
                  index={index}
                  onRemove={(idx) => onRemoveAction(selectedSpriteId, idx)}
                  isPlaying={isPlaying}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

// Fixed Sprite Component (no multi-keyframe animations) with Boundary Restrictions
const Sprite = ({ sprite, isSelected, onSelect, onMove, stageWidth, stageHeight }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [stageRect, setStageRect] = useState(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    let stageElement = e.currentTarget.parentElement;
    while (stageElement && !stageElement.classList.contains('stage-container')) {
      stageElement = stageElement.parentElement;
    }
    
    if (stageElement) {
      const rect = stageElement.getBoundingClientRect();
      setStageRect(rect);
      setDragStart({
        x: e.clientX - rect.left - sprite.x,
        y: e.clientY - rect.top - sprite.y
      });
    }
    
    setIsDragging(true);
    onSelect(sprite.id);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !stageRect) return;
    
    // Strict boundary enforcement - sprites cannot go outside stage boundaries
    const x = Math.max(30, Math.min(stageWidth - 30, e.clientX - stageRect.left - dragStart.x));
    const y = Math.max(30, Math.min(stageHeight - 30, e.clientY - stageRect.top - dragStart.y));
    onMove(sprite.id, x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setStageRect(null);
  };

useEffect(() => {
  if (isDragging) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }
}, [isDragging, stageRect, dragStart, handleMouseMove, handleMouseUp]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: sprite.x - 25,
        top: sprite.y - 25,
        cursor: 'pointer',
        zIndex: isSelected ? 10 : 1
      }}
      animate={{
        scale: sprite.hasCollided ? 1.3 : sprite.size, // Fixed: single keyframe instead of [1, 1.3, 1]
        rotate: sprite.rotation
      }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      onMouseDown={handleMouseDown}
      className={`select-none ${isSelected ? 'ring-4 ring-blue-400 rounded-full bg-blue-100/50' : ''} p-2`}
      whileHover={{ scale: sprite.size * 1.1 }}
      whileTap={{ scale: sprite.size * 0.95 }}
    >
      <div className="text-5xl drop-shadow-2xl filter hover:brightness-110 transition-all">
        {ANIMALS_LIST[sprite.name] || '🎯'}
      </div>
      {sprite.speech && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 10 }}
          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 text-sm rounded-2xl whitespace-nowrap shadow-2xl border backdrop-blur-sm ${
            sprite.speechType === 'think' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-300' 
              : 'bg-gradient-to-r from-white to-blue-50 text-gray-800 border-gray-200'
          }`}
        >
          {sprite.speechType === 'think' && '💭 '}
          <span className="font-medium">{sprite.speech}</span>
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
            sprite.speechType === 'think' ? 'border-t-4 border-t-blue-500' : 'border-t-4 border-t-white'
          }`}></div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Stage Component - Now takes half screen width with strict boundaries
const Stage = ({ sprites, selectedSpriteId, onSpriteSelect, onSpriteMove, stageWidth, stageHeight }) => {
  return (
    <div 
      className="stage-container relative w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 border-4 border-blue-300 rounded-3xl overflow-hidden shadow-2xl"
      style={{ width: stageWidth, height: stageHeight, minWidth: stageWidth, minHeight: stageHeight }}
    >
      {/* Stage boundary indicator */}
      <div className="absolute inset-2 border-2 border-dashed border-blue-300/50 rounded-xl pointer-events-none"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute top-8 right-8 w-6 h-6 bg-pink-300 rounded-full animate-ping"></div>
        <div className="absolute bottom-6 left-8 w-4 h-4 bg-green-300 rounded-full animate-pulse"></div>
      </div>
      
      <AnimatePresence>
        {sprites.map((sprite) => (
          <Sprite
            key={sprite.id}
            sprite={sprite}
            isSelected={selectedSpriteId === sprite.id}
            onSelect={onSpriteSelect}
            onMove={onSpriteMove}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Playback Controls
const PlaybackControls = ({ 
  onPlay, 
  onPause, 
  onStop, 
  onRemoveSprite, 
  isPlaying, 
  selectedSpriteId, 
  sprites, 
  spriteActions,
  playForAll,
  setPlayForAll
}) => {
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);
  const hasActions = selectedSpriteId && spriteActions[selectedSpriteId]?.length > 0;
  const hasAnyActions = Object.values(spriteActions).some(actions => actions?.length > 0);

  return (
    <div className="space-y-6">
      {/* Play Mode Toggle */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <label className="flex items-center gap-4 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={playForAll}
            onChange={(e) => setPlayForAll(e.target.checked)}
            disabled={isPlaying}
            className="w-5 h-5 text-blue-600 rounded-lg focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-gray-700 font-semibold text-base">🎭 Play All Sprites</span>
        </label>
      </motion.div>

      {/* Playback Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <motion.button
          onClick={onPlay}
          disabled={isPlaying || (!playForAll && !hasActions) || (playForAll && !hasAnyActions)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white px-4 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {isPlaying ? (
            <>
              <motion.div 
                className="w-3 h-3 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              ></motion.div>
              Playing
            </>
          ) : (
            <>
              ▶️ Play
            </>
          )}
        </motion.button>
        
        <motion.button
          onClick={onPause}
          disabled={!isPlaying}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ⏸️ Pause
        </motion.button>
        
        <motion.button
          onClick={onStop}
          disabled={!isPlaying}
          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 text-white px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          ⏹️ Stop
        </motion.button>
      </div>

      {/* Hero Feature Info */}
      <motion.div 
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5 shadow-lg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="text-sm text-orange-700 mb-2 font-bold flex items-center gap-2">
          ⭐ HERO FEATURE: Animation Swap on Collision
        </div>
        <div className="text-xs text-orange-600">
          When two sprites collide, they will swap their entire animation sequences! The stage has strict boundaries - sprites cannot escape.
        </div>
      </motion.div>

      {/* Selected Sprite Info */}
      {selectedSprite && (
        <motion.div 
          className="bg-gradient-to-r from-white to-blue-50 border-2 border-gray-200 rounded-2xl p-5 shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="text-sm text-gray-600 mb-3 font-medium">Selected Sprite</div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-800 font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedSprite.name}
              </span>
              <div className="text-sm text-gray-500 mt-1">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {spriteActions[selectedSpriteId]?.length || 0} actions queued
                </span>
              </div>
            </div>
            <motion.button
              onClick={() => onRemoveSprite(selectedSpriteId)}
              disabled={isPlaying}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Remove
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {/* Status Info */}
      <motion.div 
        className="text-sm bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-gray-600 font-medium">
          {playForAll 
            ? `🎪 Playing all sprites with actions (${Object.keys(spriteActions).filter(id => spriteActions[id]?.length > 0).length} active)`
            : selectedSpriteId 
              ? `🎯 Playing ${selectedSprite?.name} only`
              : '⚠️ No sprite selected'
          }
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced Collision Detection Hook - Fixed for exact challenge requirements
const useCollisionDetection = (sprites, onCollision) => {
  useEffect(() => {
    const checkCollisions = () => {
      for (let i = 0; i < sprites.length; i++) {
        for (let j = i + 1; j < sprites.length; j++) {
          const sprite1 = sprites[i];
          const sprite2 = sprites[j];
          
          const distance = Math.sqrt(
            Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2)
          );
          
          // Collision threshold
          if (distance < 55 && !sprite1.hasCollided && !sprite2.hasCollided) {
            onCollision(sprite1.id, sprite2.id);
          }
        }
      }
    };

    const interval = setInterval(checkCollisions, 100);
    return () => clearInterval(interval);
  }, [sprites, onCollision]);
};

// Main Component
function ScratchCloneMain() {
  const [sprites, setSprites] = useState([]);
  const [selectedSpriteId, setSelectedSpriteId] = useState(null);
  const [spriteIdCounter, setSpriteIdCounter] = useState(1);
  const [spriteActionQueues, setSpriteActionQueues] = useState({});
  const [currentlyExecutingActions, setCurrentlyExecutingActions] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [playForAll, setPlayForAll] = useState(true); // Default to play all for Hero Feature demo
  const [debugLogs, setDebugLogs] = useState([]);
  const playbackRef = useRef(null);

  // Calculate stage dimensions to be half of screen width
 const [stageWidth, setStageWidth] = useState(600); // Default value
const [stageHeight, setStageHeight] = useState(450); // Default value

useEffect(() => {
  if (typeof window !== 'undefined') {
    const width = Math.min(window.innerWidth * 0.5, 600);
    const height = Math.min(width * 0.75, 450);
    setStageWidth(width);
    setStageHeight(height);
  }
}, []);
  const addDebugLog = useCallback((message) => {
  const timestamp = new Date().toLocaleTimeString();
  setDebugLogs(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
}, []);

  const availableSprites = [
    { name: 'Cat', emoji: '🐱', color: 'from-orange-400 to-red-500' },
    { name: 'Dog', emoji: '🐶', color: 'from-amber-400 to-orange-500' },
    { name: 'Lion', emoji: '🦁', color: 'from-yellow-400 to-orange-500' },
    { name: 'Tiger', emoji: '🐅', color: 'from-orange-500 to-red-600' },
    { name: 'Bear', emoji: '🐻', color: 'from-amber-600 to-brown-700' },
    { name: 'Fox', emoji: '🦊', color: 'from-orange-400 to-red-500' }
  ];

  // HERO FEATURE: Enhanced collision handler that swaps COMPLETE animation sequences
  const handleCollision = useCallback((sprite1Id, sprite2Id) => {
    const sprite1 = sprites.find(s => s.id === sprite1Id);
    const sprite2 = sprites.find(s => s.id === sprite2Id);
    const sprite1Name = sprite1?.name || `Sprite${sprite1Id}`;
    const sprite2Name = sprite2?.name || `Sprite${sprite2Id}`;

    addDebugLog(`💥 COLLISION DETECTED! ${sprite1Name} ↔ ${sprite2Name}`);
    addDebugLog(`🎭 HERO FEATURE ACTIVATED: Complete Animation Swap!`);

    // Get the complete animation sequences
    const sprite1CompleteActions = [...(spriteActionQueues[sprite1Id] || [])];
    const sprite2CompleteActions = [...(spriteActionQueues[sprite2Id] || [])];
    
    // HERO FEATURE: Swap the COMPLETE animation sequences between sprites
    setSpriteActionQueues(prev => {
      addDebugLog(`✨ ${sprite1Name} now has ALL of ${sprite2Name}'s animations`);
      addDebugLog(`✨ ${sprite2Name} now has ALL of ${sprite1Name}'s animations`);
      
      return {
        ...prev,
        [sprite1Id]: sprite2CompleteActions,  // Complete swap
        [sprite2Id]: sprite1CompleteActions   // Complete swap
      };
    });

    // Visual feedback for collision (fixed single keyframe)
    setSprites(prevSprites => 
      prevSprites.map(sprite => {
        if (sprite.id === sprite1Id) {
          return {
            ...sprite,
            hasCollided: true,
            speech: `I swapped animations with ${sprite2Name}! 🎭`,
            speechType: 'say'
          };
        }
        if (sprite.id === sprite2Id) {
          return {
            ...sprite,
            hasCollided: true,
            speech: `I swapped animations with ${sprite1Name}! 🎭`,
            speechType: 'say'
          };
        }
        return sprite;
      })
    );

    // Reset collision state and speech after delay
    setTimeout(() => {
      setSprites(prevSprites => 
        prevSprites.map(sprite => {
          if (sprite.id === sprite1Id || sprite.id === sprite2Id) {
            return {
              ...sprite,
              hasCollided: false,
              speech: '',
              speechType: ''
            };
          }
          return sprite;
        })
      );
    }, 3000);
  }, [sprites, spriteActionQueues, addDebugLog]);

  useCollisionDetection(sprites, handleCollision);

  const handleAddAction = (action, spriteId) => {
    if (isPlaying) return;
    
    if (!spriteId) {
      addDebugLog(`⚠️ Please select a sprite first!`);
      return;
    }
    
    const sprite = sprites.find(s => s.id === spriteId);
    const spriteName = sprite?.name || `Sprite${spriteId}`;
    
    setSpriteActionQueues(prev => {
      const currentActions = prev[spriteId] || [];
      const newActions = [...currentActions, action];
      
      const actionDisplay = typeof action === 'string' ? action : 
        action.type === 'moveSteps' ? `Move ${action.steps} steps` :
        action.type === 'turnDegrees' ? `Turn ${action.degrees}°` :
        action.type === 'goToXY' ? `Go to (${action.x}, ${action.y})` :
        action.type === 'sayFor' ? `Say "${action.text}" for ${action.seconds}s` :
        action.type === 'thinkFor' ? `Think "${action.text}" for ${action.seconds}s` :
        action.type === 'repeat' ? `Repeat ${action.times} times` :
        JSON.stringify(action);
      
      addDebugLog(`➕ Added "${actionDisplay}" to ${spriteName}`);
      
      return {
        ...prev,
        [spriteId]: newActions
      };
    });
  };

  const handleSpriteMove = (spriteId, x, y) => {
    if (isPlaying) return;
    setSprites(prevSprites => 
      prevSprites.map(sprite => 
        sprite.id === spriteId ? { ...sprite, x, y } : sprite
      )
    );
  };

  const handleAddSprite = (spriteData) => {
    const spriteType = typeof spriteData === 'string' ? spriteData : spriteData.name;
    const existingSprite = sprites.find(sprite => sprite.name === spriteType);
    if (existingSprite) {
      addDebugLog(`🎯 ${spriteType} selected!`);
      setSelectedSpriteId(existingSprite.id);
      return;
    }

    const newSprite = {
      id: spriteIdCounter,
      name: spriteType,
      x: Math.random() * (stageWidth - 100) + 50,
      y: Math.random() * (stageHeight - 100) + 50,
      rotation: 0,
      size: 1,
      visible: true,
      speech: '',
      speechType: '',
      hasCollided: false,
    };
    setSprites(prev => [...prev, newSprite]);
    setSpriteIdCounter(prev => prev + 1);
    setSelectedSpriteId(newSprite.id);
    addDebugLog(`🌟 Added ${spriteType}`);
  };

  const handleSpriteSelect = (spriteId) => {
    if (!isPlaying) {
      if (selectedSpriteId === spriteId) {
        setSelectedSpriteId(null);
        addDebugLog(`🔍 Deselected sprite`);
      } else {
        setSelectedSpriteId(spriteId);
        const sprite = sprites.find(s => s.id === spriteId);
        addDebugLog(`🎯 Selected ${sprite?.name || 'sprite'}`);
      }
    }
  };

  const handleRemoveSprite = (spriteId) => {
    if (isPlaying) return;
    
    const sprite = sprites.find(s => s.id === spriteId);
    addDebugLog(`🗑️ Removed ${sprite?.name || 'sprite'}`);
    
    setSprites(prev => prev.filter(sprite => sprite.id !== spriteId));
    setSpriteActionQueues(prev => {
      const newQueues = { ...prev };
      delete newQueues[spriteId];
      return newQueues;
    });
    
    if (selectedSpriteId === spriteId) {
      setSelectedSpriteId(null);
    }
  };

  const handleRemoveAction = (spriteId, actionIndex) => {
    if (isPlaying) return;
    setSpriteActionQueues(prev => {
      const currentActions = prev[spriteId] || [];
      const sprite = sprites.find(s => s.id === spriteId);
      addDebugLog(`➖ Removed action from ${sprite?.name || 'sprite'}`);
      
      return {
        ...prev,
        [spriteId]: currentActions.filter((_, index) => index !== actionIndex)
      };
    });
  };

  const handleClearAllActions = (spriteId) => {
    if (isPlaying) return;
    const sprite = sprites.find(s => s.id === spriteId);
    addDebugLog(`🧹 Cleared all actions for ${sprite?.name || 'sprite'}`);
    
    setSpriteActionQueues(prev => ({
      ...prev,
      [spriteId]: []
    }));
  };

  const executeActionsSequentially = async (spriteId, actions) => {
    let remainingActions = [...actions];
    setCurrentlyExecutingActions(prev => ({
      ...prev,
      [spriteId]: remainingActions
    }));

    const sprite = sprites.find(s => s.id === spriteId);
    const spriteName = sprite?.name || `Sprite${spriteId}`;
    
    for (let i = 0; i < actions.length; i++) {
      if (!playbackRef.current) {
        addDebugLog(`⏸️ Playback interrupted for ${spriteName}`);
        break;
      }
      
      const action = remainingActions[0];
      if (!action) break;
      
      addDebugLog(`🎬 ${spriteName}: Executing action ${i + 1}/${actions.length}`);
      
      const currentSprite = sprites.find(s => s.id === spriteId);
      if (currentSprite) {
        await executeAction(currentSprite, action, setSprites, stageWidth, stageHeight);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setCurrentlyExecutingActions(prev => {
          const newRemaining = (prev[spriteId] || []).slice(1);
          return {
            ...prev,
            [spriteId]: newRemaining
          };
        });
        
        remainingActions = remainingActions.slice(1);
      } else {
        addDebugLog(`❌ Sprite ${spriteName} not found`);
        break;
      }
    }

    setCurrentlyExecutingActions(prev => {
      const newState = { ...prev };
      delete newState[spriteId];
      return newState;
    });
    addDebugLog(`✅ Finished executing actions for ${spriteName}`);
  };

  const handlePlay = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    playbackRef.current = true;
    addDebugLog(`🎬 Starting playback (Hero Feature active)...`);
    
    try {
      if (playForAll) {
        const activeSprites = Object.keys(spriteActionQueues).filter(id => {
          const actions = spriteActionQueues[id];
          return actions && Array.isArray(actions) && actions.length > 0;
        });
        
        if (activeSprites.length === 0) {
          addDebugLog(`⚠️ No sprites with actions to play`);
          setIsPlaying(false);
          playbackRef.current = null;
          return;
        }

        // Execute all sprites simultaneously for collision opportunities
        const promises = activeSprites.map(spriteId => {
          const id = parseInt(spriteId);
          return executeActionsSequentially(id, spriteActionQueues[id]);
        });
        
        await Promise.all(promises);
        
      } else {
        if (!selectedSpriteId) {
          addDebugLog(`⚠️ No sprite selected`);
          setIsPlaying(false);
          playbackRef.current = null;
          return;
        }

        const selectedActions = spriteActionQueues[selectedSpriteId];
        if (!selectedActions || selectedActions.length === 0) {
          addDebugLog(`⚠️ No actions queued for selected sprite`);
          setIsPlaying(false);
          playbackRef.current = null;
          return;
        }

        await executeActionsSequentially(selectedSpriteId, selectedActions);
      }
      
    } catch (error) {
      addDebugLog(`💥 Error during playback: ${error.message}`);
    } finally {
      setIsPlaying(false);
      playbackRef.current = null;
      setCurrentlyExecutingActions({});
      addDebugLog(`🏁 Playback finished! Check for Hero Feature activation!`);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    playbackRef.current = null;
    addDebugLog(`⏸️ Paused`);
  };

  const handleStop = () => {
    setIsPlaying(false);
    playbackRef.current = null;
    setCurrentlyExecutingActions({});
    setSprites(prev => prev.map(sprite => ({
      ...sprite,
      speech: '',
      speechType: '',
      hasCollided: false,
      size: 1
    })));
    addDebugLog(`⏹️ Stopped and reset all sprites`);
  };

  const handleClearAll = () => {
    addDebugLog(`🧹 Clearing all data...`);
    
    setSprites([]);
    setSpriteActionQueues({});
    setCurrentlyExecutingActions({});
    setSelectedSpriteId(null);
    setSpriteIdCounter(1);
    setIsPlaying(false);
    setPlayForAll(true);
    
    if (playbackRef.current) {
      playbackRef.current = null;
    }
    
    setTimeout(() => {
      setDebugLogs(['🚀 System reset! Ready for new Hero Feature demo.']);
    }, 500);
  };

  // HERO FEATURE DEMO SETUP - Exactly matching challenge requirements
  const heroFeatureDemo = () => {
    setSprites([]);
    setSpriteActionQueues({});
    setSelectedSpriteId(null);
    
    // Character 1: Move 10 steps (repeatedly moving right)
    const character1 = {
      id: 1,
      name: 'Cat',
      x: 80,
      y: stageHeight / 2,
      rotation: 0,
      size: 1,
      visible: true,
      speech: '',
      speechType: '',
      hasCollided: false,
    };
    
    // Character 2: Move -10 steps (repeatedly moving left)
    const character2 = {
      id: 2,
      name: 'Dog',
      x: stageWidth - 80,
      y: stageHeight / 2,
      rotation: 0,
      size: 1,
      visible: true,
      speech: '',
      speechType: '',
      hasCollided: false,
    };
    
    setSprites([character1, character2]);
    
    // EXACT Challenge Example:
    // Character 1: [Move 10 steps, repeat animation]
    // Character 2: [Move -10 steps, repeat animation]
    setSpriteActionQueues({
      [character1.id]: [
        { type: 'moveSteps', steps: 10 },
        { type: 'repeat', times: 5, actions: [{ type: 'moveSteps', steps: 10 }] }
      ],
      [character2.id]: [
        { type: 'moveSteps', steps: -10 },
        { type: 'repeat', times: 5, actions: [{ type: 'moveSteps', steps: -10 }] }
      ]
    });
    
    setSpriteIdCounter(3);
    setSelectedSpriteId(character1.id);
    setPlayForAll(true); // Ensure both sprites play simultaneously
    
    addDebugLog('🎭 HERO FEATURE DEMO: Challenge Requirements Met!');
    addDebugLog('Character 1 (Cat): Move 10 steps + repeat animation');
    addDebugLog('Character 2 (Dog): Move -10 steps + repeat animation');
    addDebugLog('💥 When they collide, animations will COMPLETELY SWAP!');
    addDebugLog('🚀 Click PLAY to see the Hero Feature in action!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center mb-8"
        >
          <div className="absolute top-0 right-0">
            <motion.button
              onClick={handleClearAll}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              🗑️ Clear All
            </motion.button>
          </div>
          <motion.h1 
            className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
          >
            ✨ Scratch Clone - Hero Feature Edition ✨
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-xl font-medium mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            🎨 Visual Programming with COLLISION-BASED ANIMATION SWAP
          </motion.p>
          <motion.div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm inline-block shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            ⭐ HERO FEATURE: Complete Animation Swap on Collision! Stage = Half Screen Width
          </motion.div>
        </motion.div>

        {/* Sprite Library */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
            <motion.h2 
              className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              🎭 Sprite Library
              <span className="text-sm font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {sprites.length} active
              </span>
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Hero Feature Demo Button - Most Important */}
              <motion.button
                onClick={heroFeatureDemo}
                disabled={isPlaying}
                className={`bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 hover:from-red-600 hover:via-pink-600 hover:to-purple-700 text-white p-6 rounded-3xl text-sm font-bold transition-all duration-300 flex flex-col items-center gap-3 shadow-2xl border-3 border-red-300 ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={isPlaying ? {} : { scale: 1.05, y: -5 }}
                whileTap={isPlaying ? {} : { scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
              >
                <motion.div 
                  className="text-4xl"
                  animate={isPlaying ? {} : { 
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  💥
                </motion.div>
                <span>HERO FEATURE DEMO</span>
                <span className="text-xs opacity-80">Challenge Example</span>
              </motion.button>

              {/* Available sprites */}
              {availableSprites.slice(0, 3).map((spriteData, index) => {
                const isAlreadyAdded = sprites.some(sprite => sprite.name === spriteData.name);
                const existingSprite = sprites.find(sprite => sprite.name === spriteData.name);
                const isSelected = existingSprite && selectedSpriteId === existingSprite.id;
                
                return (
                  <motion.div
                    key={spriteData.name}
                    className="relative"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: (index + 2) * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <motion.button
                      onClick={() => handleAddSprite(spriteData)}
                      disabled={isPlaying}
                      className={`${
                        isAlreadyAdded 
                          ? isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 text-white shadow-xl'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-400 text-white'
                          : `bg-gradient-to-r ${spriteData.color} hover:shadow-xl border-gray-300 text-white hover:border-blue-400`
                      } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''} border-3 p-6 rounded-3xl text-sm font-bold transition-all duration-300 flex flex-col items-center gap-3 shadow-lg w-full relative`}
                      whileHover={isPlaying ? {} : { scale: 1.05, y: -5 }}
                      whileTap={isPlaying ? {} : { scale: 0.95 }}
                    >
                      <div className="text-4xl filter drop-shadow-lg">
                        {spriteData.emoji}
                      </div>
                      <span className="font-bold">
                        {isAlreadyAdded ? (isSelected ? '✨ Selected' : '✅ Added') : `+ ${spriteData.name}`}
                      </span>
                    </motion.button>
                    
                    {/* Remove button for added sprites */}
                    {isAlreadyAdded && (
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const spriteToRemove = sprites.find(s => s.name === spriteData.name);
                          if (spriteToRemove) {
                            handleRemoveSprite(spriteToRemove.id);
                          }
                        }}
                        disabled={isPlaying}
                        className="absolute -top-3 -right-3 w-9 h-9 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full text-lg flex items-center justify-center shadow-lg z-20 font-bold border-2 border-white"
                        whileHover={isPlaying ? {} : { scale: 1.15, rotate: 90 }}
                        whileTap={isPlaying ? {} : { scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        ×
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content - Stage takes half screen width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Panel - Code Area */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Motion Blocks */}
            <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-3xl p-6 shadow-2xl">
              <motion.h3 
                className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🏃‍♂️ Motion Blocks
              </motion.h3>
              <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
                <MotionBlocks isPlaying={isPlaying} />
              </div>
            </div>

            {/* Looks Blocks */}
            <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-3xl p-6 shadow-2xl">
              <motion.h3 
                className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🎨 Looks Blocks
              </motion.h3>
              <div className="max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
                <LooksBlocks isPlaying={isPlaying} />
              </div>
            </div>

            {/* Code Area */}
            <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
              <CodeArea
                spriteActions={spriteActionQueues}
                selectedSpriteId={selectedSpriteId}
                sprites={sprites}
                onAddAction={handleAddAction}
                onRemoveAction={handleRemoveAction}
                onClearAllActions={handleClearAllActions}
                isPlaying={isPlaying}
              />
            </div>
          </motion.div>

          {/* Right Panel - Stage & Controls (Half Screen Width) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Stage - Half Screen Width */}
            <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-3xl p-6 shadow-2xl">
              <motion.h3 
                className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🎪 Performance Stage
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-normal">
                  Half Screen Width
                </span>
              </motion.h3>
              <div className="flex justify-center">
                <Stage
                  sprites={sprites}
                  selectedSpriteId={selectedSpriteId}
                  onSpriteSelect={handleSpriteSelect}
                  onSpriteMove={handleSpriteMove}
                  stageWidth={stageWidth}
                  stageHeight={stageHeight}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-3xl p-6 shadow-2xl">
              <motion.h3 
                className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🎮 Control Center
              </motion.h3>
              <PlaybackControls
                onPlay={handlePlay}
                onPause={handlePause}
                onStop={handleStop}
                onRemoveSprite={handleRemoveSprite}
                isPlaying={isPlaying}
                selectedSpriteId={selectedSpriteId}
                sprites={sprites}
                spriteActions={spriteActionQueues}
                playForAll={playForAll}
                setPlayForAll={setPlayForAll}
              />
            </div>
          </motion.div>
        </div>

        {/* Event Log */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/70 backdrop-blur-md border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <motion.h3 
                className="text-2xl font-bold text-gray-800 flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                📋 Event Log
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
                  Hero Feature Active
                </span>
              </motion.h3>
              <motion.button
                onClick={() => setDebugLogs([])}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-2xl font-medium shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                🧹 Clear
              </motion.button>
            </div>
            <div className="bg-gray-900 rounded-2xl p-6 border-2 border-gray-700 shadow-inner">
              <div className="text-sm max-h-40 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <AnimatePresence>
                  {debugLogs.length === 0 ? (
                    <motion.p 
                      className="text-green-400 font-mono flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      System ready for HERO FEATURE demo! Click the red demo button to see collision-based animation swap! 🚀
                      <br />
                      <span className="text-yellow-400 ml-4">💥 CHALLENGE: When sprites collide, their complete animation sequences swap!</span>
                      <br />
                      <span className="text-cyan-400 ml-4">🎭 Stage = Half Screen Width with Strict Boundaries!</span>
                    </motion.p>
                  ) : (
                    debugLogs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="text-cyan-300 bg-gray-800/50 p-3 rounded-xl font-mono text-xs border border-cyan-500/20 shadow-lg flex items-center gap-2"
                      >
                        <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0"></span>
                        <span>{log}</span>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Export the component wrapped with DndProvider
export default function ScratchClone() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ScratchCloneMain />
    </DndProvider>
  );
}