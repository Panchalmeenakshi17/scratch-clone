import { useEffect, useRef, useState } from 'react'

const Sprite = ({ sprite, isSelected, onClick, onUpdate }) => {
  const [bubble, setBubble] = useState(null)

  const handleClick = () => {
    onClick(sprite.id)
  }

  return (
    <>
      <div
        className={`sprite ${isSelected ? 'active' : ''}`}
        style={{
          left: sprite.x,
          top: sprite.y,
          backgroundColor: sprite.color,
          transform: `rotate(${sprite.rotation}deg)`,
        }}
        onClick={handleClick}
      >
        {sprite.name.charAt(0)}
      </div>
      
      {bubble && (
        <div
          className={bubble.type === 'say' ? 'speech-bubble' : 'thought-bubble'}
          style={{
            left: sprite.x + 70,
            top: sprite.y - 10,
          }}
        >
          {bubble.text}
        </div>
      )}
    </>
  )
}

export default function SpriteCanvas({ 
  sprites, 
  selectedSpriteId, 
  onSpriteSelect, 
  onSpriteUpdate, 
  isPlaying 
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [spriteStates, setSpriteStates] = useState({})
  const [bubbles, setBubbles] = useState({})

  // Initialize sprite states
  useEffect(() => {
    const states = {}
    sprites.forEach(sprite => {
      states[sprite.id] = {
        currentAnimationIndex: 0,
        repeatCount: 0,
        isAnimating: false,
        animationStartTime: 0,
        x: sprite.x,
        y: sprite.y,
        rotation: sprite.rotation
      }
    })
    setSpriteStates(states)
  }, [sprites])

  // Collision detection
  const checkCollision = (sprite1, sprite2) => {
    const dx = sprite1.x - sprite2.x
    const dy = sprite1.y - sprite2.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance < 60 // Collision threshold
  }

  // Hero Feature: Swap animations on collision
  const handleCollision = (sprite1Id, sprite2Id) => {
    const sprite1 = sprites.find(s => s.id === sprite1Id)
    const sprite2 = sprites.find(s => s.id === sprite2Id)
    
    if (sprite1 && sprite2) {
      // Swap animations
      const sprite1Animations = [...sprite1.animations]
      const sprite2Animations = [...sprite2.animations]
      
      onSpriteUpdate(sprite1Id, { animations: sprite2Animations })
      onSpriteUpdate(sprite2Id, { animations: sprite1Animations })
      
      console.log(`Collision detected! Swapped animations between ${sprite1.name} and ${sprite2.name}`)
    }
  }

  // Execute animation
  const executeAnimation = (sprite, animation, currentTime) => {
    const values = animation.values || {}
    
    switch (animation.type) {
      case 'move':
        const steps = values.steps || 10
        const radians = (sprite.rotation || 0) * Math.PI / 180
        const newX = sprite.x + Math.cos(radians) * steps
        const newY = sprite.y + Math.sin(radians) * steps
        
        // Keep sprite within canvas bounds
        const boundedX = Math.max(0, Math.min(canvasRef.current?.clientWidth - 60 || 400, newX))
        const boundedY = Math.max(0, Math.min(canvasRef.current?.clientHeight - 60 || 300, newY))
        
        onSpriteUpdate(sprite.id, { x: boundedX, y: boundedY })
        break
        
      case 'turn':
        const degrees = values.degrees || 15
        const newRotation = (sprite.rotation || 0) + degrees
        onSpriteUpdate(sprite.id, { rotation: newRotation })
        break
        
      case 'goto':
        const targetX = values.x || 0
        const targetY = values.y || 0
        onSpriteUpdate(sprite.id, { x: targetX, y: targetY })
        break
        
      case 'say':
      case 'think':
        const text = values.text || (animation.type === 'say' ? 'Hello!' : 'Hmm...')
        const duration = (values.duration || 2) * 1000
        
        setBubbles(prev => ({
          ...prev,
          [sprite.id]: { type: animation.type, text, startTime: currentTime }
        }))
        
        // Remove bubble after duration
        setTimeout(() => {
          setBubbles(prev => {
            const newBubbles = { ...prev }
            delete newBubbles[sprite.id]
            return newBubbles
          })
        }, duration)
        break
    }
  }

  // Animation loop
  const animate = (currentTime) => {
    if (!isPlaying) return

    sprites.forEach(sprite => {
      if (sprite.animations.length === 0) return

      const state = spriteStates[sprite.id]
      if (!state) return

      const currentAnimation = sprite.animations[state.currentAnimationIndex]
      if (!currentAnimation) return

      // Handle repeat animation
      if (currentAnimation.type === 'repeat') {
        const times = currentAnimation.values?.times || 10
        
        if (state.repeatCount < times) {
          // Execute all other animations in sequence
          sprite.animations.forEach((anim, index) => {
            if (anim.type !== 'repeat') {
              executeAnimation(sprite, anim, currentTime)
            }
          })
          
          setSpriteStates(prev => ({
            ...prev,
            [sprite.id]: { ...prev[sprite.id], repeatCount: state.repeatCount + 1 }
          }))
        }
      } else {
        // Execute current animation
        executeAnimation(sprite, currentAnimation, currentTime)
        
        // Move to next animation
        setSpriteStates(prev => ({
          ...prev,
          [sprite.id]: {
            ...prev[sprite.id],
            currentAnimationIndex: (state.currentAnimationIndex + 1) % sprite.animations.length
          }
        }))
      }
    })

    // Check for collisions
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        if (checkCollision(sprites[i], sprites[j])) {
          handleCollision(sprites[i].id, sprites[j].id)
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      // Reset sprite states when starting
      const resetStates = {}
      sprites.forEach(sprite => {
        resetStates[sprite.id] = {
          currentAnimationIndex: 0,
          repeatCount: 0,
          isAnimating: true,
          animationStartTime: performance.now()
        }
      })
      setSpriteStates(resetStates)
      
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, sprites])

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Stage</h3>
      <div
        ref={canvasRef}
        className="relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{ height: '400px' }}
      >
        {sprites.map(sprite => (
          <Sprite
            key={sprite.id}
            sprite={sprite}
            isSelected={sprite.id === selectedSpriteId}
            onClick={onSpriteSelect}
            onUpdate={onSpriteUpdate}
          />
        ))}
        
        {/* Render speech/thought bubbles */}
        {Object.entries(bubbles).map(([spriteId, bubble]) => {
          const sprite = sprites.find(s => s.id === parseInt(spriteId))
          if (!sprite) return null
          
          return (
            <div
              key={spriteId}
              className={bubble.type === 'say' ? 'speech-bubble' : 'thought-bubble'}
              style={{
                left: sprite.x + 70,
                top: sprite.y - 10,
              }}
            >
              {bubble.text}
            </div>
          )
        })}
        
        {/* Canvas grid for reference */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={`h-${i}`}
              className="absolute border-t border-gray-400"
              style={{ top: `${i * 10}%`, width: '100%' }}
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={`v-${i}`}
              className="absolute border-l border-gray-400"
              style={{ left: `${i * 10}%`, height: '100%' }}
            />
          ))}
        </div>
      </div>
      
      {isPlaying && (
        <div className="mt-2 text-sm text-blue-600 font-medium">
          🎬 Animation running... Watch for collisions!
        </div>
      )}
    </div>
  )
}