"use client"

import { useEffect, useRef, useState } from "react"
import { PaintbrushIcon as Canvas, Download, Eye, EyeOff } from "lucide-react"

export default function StringArtCanvas({ originalImage, stringArtData, parameters, isProcessing }) {
  const canvasRef = useRef(null)
  const [showGrayscale, setShowGrayscale] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const size = parameters.canvasSize

    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    if (originalImage && !stringArtData && !isProcessing) {
      // Show original image with reduced opacity
      ctx.globalAlpha = 0.4
      ctx.drawImage(originalImage.element, 0, 0, size, size)
      ctx.globalAlpha = 1

      // Add text overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Click 'Generate String Art' to process", size / 2, size - 20)
    }

    if (stringArtData) {
      if (showGrayscale && stringArtData.grayscaleImage) {
        drawGrayscalePreview(ctx, stringArtData.grayscaleImage, size)
      } else {
        drawStringArt(ctx, stringArtData, size)
      }
    }
  }, [originalImage, stringArtData, parameters, isProcessing, showGrayscale])

  const drawGrayscalePreview = (ctx, grayscaleData, size) => {
    // Create a temporary canvas for the grayscale image
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    tempCanvas.width = grayscaleData.width
    tempCanvas.height = grayscaleData.height

    // Put the grayscale image data
    tempCtx.putImageData(grayscaleData.imageData, 0, 0)

    // Draw it scaled to our canvas
    ctx.drawImage(tempCanvas, 0, 0, size, size)

    // Add overlay text
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.fillRect(10, 10, 120, 25)
    ctx.fillStyle = "black"
    ctx.font = "12px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Grayscale Preview", 15, 27)
  }

  const drawStringArt = (ctx, data, size) => {
    const { pins, connections } = data
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 20

    // Clear with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Draw string connections first (behind pins)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Group connections by quality for better rendering
    const connectionGroups = {
      high: [],
      medium: [],
      low: [],
    }

    connections.forEach((connection, index) => {
      const score = connection.score || 0.5
      const orderFactor = 1 - (index / connections.length) * 0.3
      const finalScore = score * orderFactor

      if (finalScore > 0.7) {
        connectionGroups.high.push(connection)
      } else if (finalScore > 0.4) {
        connectionGroups.medium.push(connection)
      } else {
        connectionGroups.low.push(connection)
      }
    })

    // Draw low quality connections first (lightest)
    ctx.strokeStyle = `rgba(0, 0, 0, ${parameters.lineOpacity * 0.3})`
    ctx.lineWidth = 0.5
    connectionGroups.low.forEach((connection) => {
      const pin1 = pins[connection.from]
      const pin2 = pins[connection.to]
      ctx.beginPath()
      ctx.moveTo(pin1.x, pin1.y)
      ctx.lineTo(pin2.x, pin2.y)
      ctx.stroke()
    })

    // Draw medium quality connections
    ctx.strokeStyle = `rgba(0, 0, 0, ${parameters.lineOpacity * 0.6})`
    ctx.lineWidth = 0.7
    connectionGroups.medium.forEach((connection) => {
      const pin1 = pins[connection.from]
      const pin2 = pins[connection.to]
      ctx.beginPath()
      ctx.moveTo(pin1.x, pin1.y)
      ctx.lineTo(pin2.x, pin2.y)
      ctx.stroke()
    })

    // Draw high quality connections last (darkest)
    ctx.strokeStyle = `rgba(0, 0, 0, ${parameters.lineOpacity * 0.9})`
    ctx.lineWidth = 0.9
    connectionGroups.high.forEach((connection) => {
      const pin1 = pins[connection.from]
      const pin2 = pins[connection.to]
      ctx.beginPath()
      ctx.moveTo(pin1.x, pin1.y)
      ctx.lineTo(pin2.x, pin2.y)
      ctx.stroke()
    })

    // Draw pins on top
    ctx.fillStyle = "#2d3748"
    pins.forEach((pin) => {
      ctx.beginPath()
      ctx.arc(pin.x, pin.y, 1.5, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw pin numbers for first few pins (helpful for instructions)
    ctx.fillStyle = "#e53e3e"
    ctx.font = "8px Arial"
    ctx.textAlign = "center"
    for (let i = 0; i < Math.min(15, pins.length); i++) {
      const pin = pins[i]
      const offsetX = pin.x < centerX ? -10 : 10
      const offsetY = pin.y < centerY ? -10 : 10
      ctx.fillText((i + 1).toString(), pin.x + offsetX, pin.y + offsetY)
    }

    // Add quality indicator
    const highCount = connectionGroups.high.length
    const totalCount = connections.length
    const qualityPercent = Math.round((highCount / totalCount) * 100)

    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(10, size - 40, 150, 25)
    ctx.fillStyle = "black"
    ctx.font = "11px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`Quality: ${qualityPercent}% high-quality lines`, 15, size - 22)
  }

  const downloadCanvas = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = "string-art.png"
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Canvas className="w-5 h-5" />
          String Art Preview
        </h2>
        <div className="flex gap-2">
          {stringArtData && stringArtData.grayscaleImage && (
            <button
              onClick={() => setShowGrayscale(!showGrayscale)}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm"
            >
              {showGrayscale ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showGrayscale ? "String Art" : "Grayscale"}
            </button>
          )}
          {stringArtData && (
            <button
              onClick={downloadCanvas}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg max-w-full h-auto"
            style={{ maxWidth: "400px", maxHeight: "400px" }}
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Processing grayscale image...</p>
                <p className="text-xs text-gray-500 mt-1">Applying advanced algorithms</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!originalImage && !isProcessing && (
        <div className="text-center text-gray-500 py-8">
          <Canvas className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Upload an image to see the string art preview</p>
        </div>
      )}

      {stringArtData && (
        <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <h4 className="font-medium mb-2">Processing Steps Applied:</h4>
          <ul className="space-y-1 text-xs">
            <li>✓ Converted to grayscale using luminance formula</li>
            <li>✓ Applied Gaussian blur for noise reduction</li>
            <li>✓ Enhanced contrast with power law transformation</li>
            <li>✓ Applied histogram equalization</li>
            <li>✓ Sobel edge detection with non-maximum suppression</li>
            <li>✓ Circular masking with soft falloff</li>
            <li>✓ Generated {stringArtData.connections?.length || 0} optimized connections</li>
          </ul>
        </div>
      )}
    </div>
  )
}
