"use client"

import { useState } from "react"
import ImageUploader from "./components/ImageUploader"
import StringArtCanvas from "./components/StringArtCanvas"
import ControlPanel from "./components/ControlPanel"
import InstructionsPanel from "./components/InstructionsPanel"
import { processImageToStringArt } from "./utils/stringArtProcessor"

function App() {
  const [originalImage, setOriginalImage] = useState(null)
  const [stringArtData, setStringArtData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parameters, setParameters] = useState({
    pins: 200,
    lines: 3000,
    lineOpacity: 0.3,
    threshold: 128,
    canvasSize: 400,
  })

  const handleImageUpload = (imageFile) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setOriginalImage({
          element: img,
          file: imageFile,
          dataUrl: e.target.result,
        })
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(imageFile)
  }

  const generateStringArt = async () => {
    if (!originalImage) return

    setIsProcessing(true)
    try {
      const result = await processImageToStringArt(originalImage.element, parameters)
      setStringArtData(result)
    } catch (error) {
      console.error("Error generating string art:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleParameterChange = (newParams) => {
    setParameters((prev) => ({ ...prev, ...newParams }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">String Art Generator</h1>
          <p className="text-gray-600 mt-2">
            Convert your images into beautiful string art with step-by-step instructions
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Controls */}
          <div className="space-y-6">
            <ImageUploader onImageUpload={handleImageUpload} originalImage={originalImage} />

            <ControlPanel
              parameters={parameters}
              onParameterChange={handleParameterChange}
              onGenerate={generateStringArt}
              isProcessing={isProcessing}
              hasImage={!!originalImage}
            />
          </div>

          {/* Middle Column - Canvas */}
          <div className="lg:col-span-1">
            <StringArtCanvas
              originalImage={originalImage}
              stringArtData={stringArtData}
              parameters={parameters}
              isProcessing={isProcessing}
            />
          </div>

          {/* Right Column - Instructions */}
          <div className="lg:col-span-1">
            <InstructionsPanel stringArtData={stringArtData} parameters={parameters} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
