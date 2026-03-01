import React, { useState, useEffect, useRef } from "react"
import { IoLogOutOutline } from "react-icons/io5"

interface SolutionCommandsProps {
  extraScreenshots: any[]
  onTooltipVisibilityChange?: (visible: boolean, height: number) => void
}

const SolutionCommands: React.FC<SolutionCommandsProps> = ({
  extraScreenshots,
  onTooltipVisibilityChange
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (onTooltipVisibilityChange) {
      let tooltipHeight = 0
      if (tooltipRef.current && isTooltipVisible) {
        tooltipHeight = tooltipRef.current.offsetHeight + 10 // Adjust if necessary
      }
      onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)
    }
  }, [isTooltipVisible, onTooltipVisibilityChange])

  const handleMouseEnter = () => {
    setIsTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
  }

  return (
    <div>
      <div className="pt-2 w-fit">
        <div className="bg-black border border-white/20 py-2 px-4 flex items-center justify-center gap-6 select-none shadow-xl">
          {/* Show/Hide */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 group-hover:text-white transition-colors">Toggle</span>
            <div className="flex gap-1">
              <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                ⌘
              </kbd>
              <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                B
              </kbd>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-4 bg-white/10 mx-2" />

          {/* Screenshot */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 group-hover:text-white transition-colors truncate">
              {extraScreenshots.length === 0
                ? "Snap Code"
                : "Snap"}
            </span>
            <div className="flex gap-1">
              <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                ⌘
              </kbd>
              <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                H
              </kbd>
            </div>
          </div>

          {extraScreenshots.length > 0 && (
            <>
              <div className="w-px h-4 bg-white/10 mx-2" />
              <div className="flex items-center gap-2 group cursor-pointer">
                <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 group-hover:text-white transition-colors">Debug</span>
                <div className="flex gap-1">
                  <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                    ⌘
                  </kbd>
                  <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                    ↵
                  </kbd>
                </div>
              </div>
            </>
          )}

          <div className="w-px h-4 bg-white/10 mx-2" />

          {/* Start Over */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 group-hover:text-white transition-colors">Reset</span>
            <div className="flex gap-1">
              <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                ⌘
              </kbd>
              <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                R
              </kbd>
            </div>
          </div>

          {/* Question Mark with Tooltip */}
          <div
            className="relative inline-block ml-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Question mark circle */}
            <div className="w-5 h-5 bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-help z-10 border border-white/10">
              <span className="text-[10px] font-mono text-white/70">?</span>
            </div>

            {/* Tooltip Content */}
            {isTooltipVisible && (
              <div
                ref={tooltipRef}
                className="absolute top-full right-0 mt-2 w-80"
                style={{ zIndex: 100 }}
              >
                <div className="p-4 bg-black border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {/* Tooltip content */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-white border-b border-white/10 pb-2">
                      Keyboard Shortcuts
                    </h3>
                    <div className="space-y-4">
                      {/* Toggle Command */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-gray-300">
                            Toggle Window
                          </span>
                          <div className="flex gap-1">
                            <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-white/10">
                              ⌘
                            </span>
                            <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-white/10">
                              B
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono">
                          Show or hide this window.
                        </p>
                      </div>
                      {/* Screenshot Command */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-gray-300">
                            Take Screenshot
                          </span>
                          <div className="flex gap-1">
                            <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-white/10">
                              ⌘
                            </span>
                            <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-white/10">
                              H
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono">
                          Capture code or questions for context.
                        </p>
                      </div>
                      {/* Debug Command */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-gray-300">Debug</span>
                          <div className="flex gap-1">
                            <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-white/10">
                              ⌘
                            </span>
                            <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-white/10">
                              ↵
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono">
                          Process snapshots and generate solutions.
                        </p>
                      </div>
                      {/* Start Over Command */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-gray-300">Reset</span>
                          <div className="flex gap-1">
                            <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-white/10">
                              ⌘
                            </span>
                            <span className="bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-white/10">
                              R
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono">
                          Clear context and start fresh.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            className="text-red-500/70 hover:text-red-500/90 transition-colors hover:cursor-pointer"
            title="Sign Out"
            onClick={() => window.electronAPI.quitApp()}
          >
            <IoLogOutOutline className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SolutionCommands
