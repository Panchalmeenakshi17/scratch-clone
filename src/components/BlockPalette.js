import { useDrag } from 'react-dnd'

const DraggableBlock = ({ type, children, className, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`block ${className} ${isDragging ? 'opacity-50 scale-95' : ''}`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

const InputField = ({ placeholder = "10", width = "w-12" }) => (
  <input
    type="text"
    placeholder={placeholder}
    className={`input-field ${width}`}
    onClick={(e) => e.stopPropagation()}
  />
)

export default function BlockPalette() {
  return (
    <div className="p-6 space-y-8">
      {/* Motion Category */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">MOTION</h3>
        </div>
        
        <DraggableBlock type="move" className="motion-block" icon="🚀">
          <div className="flex items-center gap-2">
            move <InputField placeholder="10" /> steps
          </div>
        </DraggableBlock>

        <DraggableBlock type="turn" className="motion-block" icon="🔄">
          <div className="flex items-center gap-2">
            turn <InputField placeholder="15" width="w-12" /> degrees
          </div>
        </DraggableBlock>

        <DraggableBlock type="goto" className="motion-block" icon="📍">
          <div className="flex items-center gap-2">
            go to x: <InputField placeholder="0" width="w-12" /> y: <InputField placeholder="0" width="w-12" />
          </div>
        </DraggableBlock>
      </div>

      {/* Looks Category */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">L</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">LOOKS</h3>
        </div>
        
        <DraggableBlock type="say" className="looks-block" icon="💬">
          <div className="flex items-center gap-2">
            say <InputField placeholder="Hello!" width="w-20" /> for <InputField placeholder="2" width="w-8" /> sec
          </div>
        </DraggableBlock>

        <DraggableBlock type="think" className="looks-block" icon="💭">
          <div className="flex items-center gap-2">
            think <InputField placeholder="Hmm..." width="w-20" /> for <InputField placeholder="2" width="w-8" /> sec
          </div>
        </DraggableBlock>
      </div>

      {/* Control Category */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">CONTROL</h3>
        </div>
        
        <DraggableBlock type="repeat" className="control-block" icon="🔁">
          <div className="flex items-center gap-2">
            repeat <InputField placeholder="10" width="w-12" /> times
          </div>
        </DraggableBlock>
      </div>

      {/* Hero Feature Info */}
      <div className="mt-8 glass p-4 rounded-2xl border border-yellow-400/30">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">🦸‍♂️</span>
          <h4 className="text-lg font-bold text-yellow-300">HERO FEATURE</h4>
        </div>
        <p className="text-yellow-100 text-sm leading-relaxed mb-3">
          When sprites collide during animation, their sequences will <span className="font-bold text-yellow-300">automatically swap</span>!
        </p>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full pulse"></div>
          <span className="text-yellow-200 text-xs font-medium">Real-time collision detection active</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="glass p-4 rounded-2xl border border-blue-400/30">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">✨</span>
          <h4 className="text-lg font-bold text-blue-300">HOW TO USE</h4>
        </div>
        <div className="space-y-2 text-blue-100 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
            <span>Drag blocks to the code area</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
            <span>Edit values by clicking inputs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            <span>Hit PLAY to see magic happen</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
            <span>Watch sprites collide and swap!</span>
          </div>
        </div>
      </div>
    </div>
  )
}