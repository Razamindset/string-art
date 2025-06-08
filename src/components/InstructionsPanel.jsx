"use client"

import { useState } from "react"
import { BookOpen, Download, Copy, Check } from "lucide-react"

export default function InstructionsPanel({ stringArtData, parameters }) {
  const [copiedStep, setCopiedStep] = useState(null)

  if (!stringArtData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Instructions
        </h2>
        <div className="text-center text-gray-500 py-8">
          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Generate string art to see step-by-step instructions</p>
        </div>
      </div>
    )
  }

  const materials = [
    `Circular wooden board or embroidery hoop (${Math.round(parameters.canvasSize / 10)}cm diameter)`,
    `${parameters.pins} small nails or pins`,
    "Hammer",
    "Black thread or string (approximately 100-200 meters)",
    "Ruler or measuring tape",
    "Pencil for marking",
    "Printed reference image",
  ]

  const setupSteps = [
    "Mark the center of your circular board",
    `Divide the circumference into ${parameters.pins} equal parts`,
    "Mark each pin position with a pencil",
    "Hammer nails into each marked position, leaving about 5mm exposed",
    "Number each nail from 1 to " + parameters.pins,
    "Tie the string to nail #1 to begin",
  ]

  const copyToClipboard = (text, stepIndex) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStep(stepIndex)
      setTimeout(() => setCopiedStep(null), 2000)
    })
  }

  const downloadInstructions = () => {
    const instructions = `
STRING ART INSTRUCTIONS

MATERIALS NEEDED:
${materials.map((item, i) => `${i + 1}. ${item}`).join("\n")}

SETUP STEPS:
${setupSteps.map((step, i) => `${i + 1}. ${step}`).join("\n")}

STRING CONNECTIONS:
${stringArtData.connections
  .slice(0, 50)
  .map((conn, i) => `${i + 1}. From pin ${conn.from + 1} to pin ${conn.to + 1}`)
  .join("\n")}

Total connections: ${stringArtData.connections.length}
Generated with String Art Generator
    `.trim()

    const blob = new Blob([instructions], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "string-art-instructions.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-h-[600px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Instructions
        </h2>
        <button
          onClick={downloadInstructions}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Materials Needed:</h3>
          <ul className="space-y-1">
            {materials.map((material, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-600 font-medium">{index + 1}.</span>
                {material}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Setup Steps:</h3>
          <ol className="space-y-2">
            {setupSteps.map((step, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-600 font-medium">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">
            String Connections ({stringArtData.connections.length} total):
          </h3>
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            {stringArtData.connections.slice(0, 50).map((connection, index) => (
              <div key={index} className="flex items-center justify-between py-1 text-sm">
                <span className="text-gray-600">
                  {index + 1}. Pin {connection.from + 1} → Pin {connection.to + 1}
                </span>
                <button
                  onClick={() => copyToClipboard(`Pin ${connection.from + 1} to Pin ${connection.to + 1}`, index)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {copiedStep === index ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            ))}
            {stringArtData.connections.length > 50 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Showing first 50 connections. Download full instructions for complete list.
              </p>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="font-medium text-yellow-800 mb-1">Tips:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Keep string tension consistent</li>
            <li>• Work in good lighting</li>
            <li>• Take breaks to avoid eye strain</li>
            <li>• Mark completed connections</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
