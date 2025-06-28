import { useDrop } from 'react-dnd'
import { useState } from 'react'

const CodeBlock = ({ animation, index, onRemove, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [values, setValues] = useState(animation.values || {})

  const handleValueChange = (key, value) => {
    const newValues = { ...values, [key]: value }
    setValues(newValues)
    onUpdate(index, { ...animation, values: newValues })
  }

  const getBlockClassName = () => {
    switch (animation.type) {
      case 'move':
      case 'turn':
      case 'goto':
        return 'motion-block'
      case 'say':
      case 'think':
        return 'looks-block'
      case 'repeat':
        return 'control-block'
      default:
        return 'motion-block'
    }
  }

  const getBlockIcon = () => {
    switch (animation.type) {
      case 'move': return '🚀'
      case 'turn': return '🔄'
      case 'goto': return '📍'
      case 'say': return '💬'
      case 'think': return '💭'
      case 'repeat': return '🔁'
      default: return '⚡'
    }
  }

  const renderBlockContent = () => {
    switch (animation.type) {
      case 'move':
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl">{getBlockIcon()}</span>
            <div className="flex items-center gap-2 flex-1">
              move
              <input
                type="number"
                value={values.steps || 10}
                onChange={(e) => handleValueChange('steps', parseInt(e.target.value) || 0)}
                className="input-field w-16"
                onClick={(e) => e.stopPropagation()}
              />
              steps
            </div>
          </div>
        )
      case 'turn':
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl">{getBlockIcon()}</span>
            <div className="flex items-center gap-2 flex-1">
              turn
              <input
                type="number"
                value={values.degrees || 15}
                onChange={(e) => handleValueChange('degrees', parseInt(e.target.value) || 0)}
                className="input-field w-16"
                onClick={(e) => e.stopPropagation()}
              />
              degrees
            </div>
          </div>
        )
      case 'goto':
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl">{getBlockIcon()}</span>
            <div className="flex items-center gap-2 flex-1">
              go to x:
              <input
                type="number"
                value={values.x || 0}
                onChange={(e) => handleValueChange('x', parseInt(e.target.value) || 0)}
                className="input-field w-16"
                onClick={(e) => e.stopPropagation()}
              />
              y:
              <input
                type="number"
                value={values.y || 0}
                onChange={(e) => handleValueChange('y', parseInt(e.target.value) || 0)}
                className="input-field w-16"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )
      case 'say':
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl">{getBlockIcon()}</span>
            <div className="flex items-center gap-2 flex-1">
              say
              <input
                type="text"
                value={values.text || 'Hello!'}
                onChange={(e) => handleValueChange('text', e.target.value)}
                className="input-field w-24"
                onClick={(e) => e.stopPropagation()}
              />
              for
              <input
                type="number"
                value={values.duration || 2}
                onChange={(e) => handleValueChange('duration', parseInt(e.target.value) || 1)}
                className="input-field w-12"
                onClick={(e) => e.stopPropagation()}
              />
              sec
            </div>
          </div>
        )
      case 'think':
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl">{getBlockIcon()}</span>
            <div className="flex items-center gap-2 flex-1">
              think
              <input
                type="text"
                value={values.text || 'Hmm...'}
                onChange={(e) => handleValueChange('text', e.target.value)}
                className="input-field w-24"
                onClick={(e) => e.stopPropagation()}
              />
              for
              <input
                type="number"
                value={values.duration || 2}
                onChange={(e) => handleValueChange('duration', parseInt(e.target.value) || 1)}
                className="input-field w-12"
                onClick={(e) => e.stopPropagation()}
              />
              sec
            </div>
          </div>
        )
      case 'repeat':
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl">{getBlockIcon()}</span>
            <div className="flex items-center gap-2 flex-1">
              repeat
              <input
                type="number"
                value={values.times || 10}
                onChange={(e) => handleValueChange('times', parseInt(e.target.value) || 1)}
                className="input-field w-16"
                onClick={(e) => e.stopPropagation()}
              />
              times
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-3">
            <span className="text-xl">{getBlockIcon()}</span>
            <span className="flex-1">{animation.type}</span>
          </div>
        )
    }
  }

  return (
    <div className={`block ${getBlockClassName()} relative group transform hover:scale-102 transition-all duration-300`}>
      {renderBlockContent()}
      <button
        onClick={() => onRemove(index)}
        className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 neon-pink"
      >
        ×
      </button>
      
      {/* Connecting line to next block */}
      {index < 10 && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-white/50 to-transparent"></div>
      )}
    </div>
  )
}

export default function CodeArea({ animations, onAddAnimation, onRemoveAnimation }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item) => {
      const newAnimation = {
        type: item.type,
        values: getDefaultValues(item.type)
      }
      onAddAnimation(newAnimation)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const getDefaultValues = (type) => {
    switch (type) {
      case 'move':
        return { steps: 10 }
      case 'turn':
        return { degrees: 15 }
      case 'goto':
        return { x: 0, y: 0 }
      case 'say':
        return { text: 'Hello!', duration: 2 }
      case 'think':
        return { text: 'Hmm...', duration: 2 }
      case 'repeat':
        return { times: 10 }
      default:
        return {}
    }
  }

  const updateAnimation = (index, updatedAnimation) => {
    console.log('Updating animation:', index, updatedAnimation)
  }

  return (
    <div
      ref={drop}
      className={`code-area transition-all duration-300 ${isOver ? 'drag-over' : ''}`}
    >
      {animations.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mb-4 float">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Drop Blocks Here</h3>
            <p className="text-blue-200 text-lg mb-4">Drag blocks from the left panel to start coding</p>
            <div className="flex justify-center space-x-4 text-sm text-blue-300">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Motion blocks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span>Looks blocks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span>Control blocks</span>
              </div>
            </div>
          </div>
          
          {/* Animated arrows */}
          <div className="flex justify-center space-x-8 opacity-50">
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>⬇</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>⬇</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>⬇</div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Execution flow indicator */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-4 h-4 rounded-full bg-green-400 pulse"></div>
            <span className="text-white font-semibold">Execution Flow</span>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-green-400 to-transparent"></div>
          </div>
          
          {animations.map((animation, index) => (
            <div key={index} className="relative">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <CodeBlock
                    animation={animation}
                    index={index}
                    onRemove={onRemoveAnimation}
                    onUpdate={updateAnimation}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Add more indicator */}
          <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-2xl hover:border-white/40 transition-colors duration-300">
            <div className="text-white/60 font-semibold">Drop more blocks here to extend your program</div>
            <div className="text-white/40 text-sm mt-1">Current sequence: {animations.length} block{animations.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      )}
    </div>
  )
}