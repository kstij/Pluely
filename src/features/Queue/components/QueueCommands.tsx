import React, { useState, useEffect, useRef } from "react"
import { IoLogOutOutline } from "react-icons/io5"
import { cn } from "../../../shared/lib/utils"
import { Dialog, DialogContent, DialogClose } from "../../../shared/ui/dialog"

interface QueueCommandsProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void
  screenshots: Array<{ path: string; preview: string }>
  onChatToggle: () => void
  onSettingsToggle: () => void
}

const QueueCommands: React.FC<QueueCommandsProps> = ({
  onTooltipVisibilityChange,
  screenshots,
  onChatToggle,
  onSettingsToggle
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioResult, setAudioResult] = useState<string | null>(null)
  const chunks = useRef<Blob[]>([])
  // Remove all chat-related state, handlers, and the Dialog overlay from this file.

  useEffect(() => {
    let tooltipHeight = 0
    if (tooltipRef.current && isTooltipVisible) {
      tooltipHeight = tooltipRef.current.offsetHeight + 10
    }
    onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)
  }, [isTooltipVisible])

  const handleMouseEnter = () => {
    setIsTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
  }

  const handleRecordClick = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        recorder.ondataavailable = (e) => chunks.current.push(e.data)
        recorder.onstop = async () => {
          const blob = new Blob(chunks.current, { type: chunks.current[0]?.type || 'audio/webm' })
          chunks.current = []
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1]
            try {
              const result = await window.electronAPI.analyzeAudioFromBase64(base64Data, blob.type)
              setAudioResult(result.text)
            } catch (err) {
              setAudioResult('Audio analysis failed.')
            }
          }
          reader.readAsDataURL(blob)
        }
        setMediaRecorder(recorder)
        recorder.start()
        setIsRecording(true)
      } catch (err) {
        setAudioResult('Could not start recording.')
      }
    } else {
      // Stop recording
      mediaRecorder?.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  // Remove handleChatSend function

  return (
    <div className="w-fit">
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

        {/* Solve Command */}
        {screenshots.length > 0 && (
          <>
            <div className="flex items-center gap-2 group cursor-pointer">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 group-hover:text-white transition-colors">Solve</span>
              <div className="flex gap-1">
                <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                  ⌘
                </kbd>
                <kbd className="bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                  ↵
                </kbd>
              </div>
            </div>
            
            <div className="w-px h-4 bg-white/10 mx-2" />
          </>
        )}

        {/* Voice Recording Button */}
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1 text-[10px] font-mono tracking-wider uppercase transition-all border",
            isRecording 
              ? "bg-white text-black border-white animate-pulse" 
              : "bg-transparent text-gray-400 border-transparent hover:text-white hover:border-white/20"
          )}
          onClick={handleRecordClick}
          type="button"
        >
          {isRecording ? "Stop Rec" : "Voice"}
        </button>

        {/* Chat Button */}
        <button
          className="flex items-center gap-2 px-3 py-1 text-[10px] font-mono tracking-wider uppercase bg-transparent text-gray-400 border border-transparent hover:text-white hover:border-white/20 transition-all"
          onClick={onChatToggle}
          type="button"
        >
          Chat
        </button>

        {/* Settings Button */}
        <button
          className="flex items-center gap-2 px-3 py-1 text-[10px] font-mono tracking-wider uppercase bg-transparent text-gray-400 border border-transparent hover:text-white hover:border-white/20 transition-all"
          onClick={onSettingsToggle}
          type="button"
        >
          Config
        </button>


        {/* Add this button in the main button row, before the separator and sign out */}
        {/* Remove the Chat button */}

        {/* Question mark with tooltip */}
        <div
          className="relative inline-block ml-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
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
                        Capture code or questions.
                      </p>
                    </div>

                    {/* Solve Command */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-300">Solve</span>
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
                        Process snapshots.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="mx-2 h-4 w-px bg-white/20" />

        {/* Sign Out Button - Moved to end */}
        <button
          className="text-red-500/70 hover:text-red-500/90 transition-colors hover:cursor-pointer"
          title="Sign Out"
          onClick={() => window.electronAPI.quitApp()}
        >
          <IoLogOutOutline className="w-4 h-4" />
        </button>
      </div>
      {/* Audio Result Display */}
      {audioResult && (
        <div className="mt-2 p-2 bg-white/10 border border-white/20 text-white text-xs max-w-md font-mono">
          <span className="font-semibold uppercase tracking-wider text-gray-400 mr-2">Audio Result:</span> {audioResult}
        </div>
      )}
      {/* Chat Dialog Overlay */}
      {/* Remove the Dialog component */}
    </div>
  )
}

export default QueueCommands

