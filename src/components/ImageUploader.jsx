"use client"

import { useRef } from "react"
import { Upload, X, ImageIcon } from "lucide-react"

export default function ImageUploader({ onImageUpload, originalImage }) {
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      onImageUpload(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const clearImage = () => {
    onImageUpload(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        Upload Image
      </h2>

      {!originalImage ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drop an image here or click to browse</p>
          <p className="text-sm text-gray-500">Supports JPG, PNG, GIF</p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      ) : (
        <div className="relative">
          <img
            src={originalImage.dataUrl || "/placeholder.svg"}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mt-2 text-sm text-gray-600">
            <p>File: {originalImage.file?.name}</p>
            <p>Size: {Math.round(originalImage.file?.size / 1024)}KB</p>
          </div>
        </div>
      )}
    </div>
  )
}
