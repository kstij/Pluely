// src/components/ScreenshotItem.tsx
import React from "react"
import { X } from "lucide-react"

interface Screenshot {
  path: string
  preview: string
}

interface ScreenshotItemProps {
  screenshot: Screenshot
  onDelete: (index: number) => void
  index: number
  isLoading: boolean
}

const ScreenshotItem: React.FC<ScreenshotItemProps> = ({
  screenshot,
  onDelete,
  index,
  isLoading
}) => {
  const handleDelete = () => {
    onDelete(index)
  }

  return (
    <div className={`relative border border-white/20 bg-black group overflow-hidden ${isLoading ? "opacity-70" : ""}`}>
      <div className="w-full aspect-video relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin" />
          </div>
        )}
        <img
          src={screenshot.preview}
          alt={`Screenshot ${index + 1}`}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
        />

        {!isLoading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            className="absolute top-2 left-2 p-1 bg-black text-white border border-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            aria-label="Delete screenshot"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default ScreenshotItem
