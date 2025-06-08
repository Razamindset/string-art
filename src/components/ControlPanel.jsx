"use client"

import { Settings, Play, Loader2 } from "lucide-react"

export default function ControlPanel({ parameters, onParameterChange, onGenerate, isProcessing, hasImage }) {
  const handleSliderChange = (key, value) => {
    onParameterChange({ [key]: Number.parseInt(value) })
  }

  const handleFloatChange = (key, value) => {
    onParameterChange({ [key]: Number.parseFloat(value) })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Parameters
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Pins: {parameters.pins}</label>
          <input
            type="range"
            min="50"
            max="400"
            value={parameters.pins}
            onChange={(e) => handleSliderChange("pins", e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50</span>
            <span>400</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Lines: {parameters.lines}</label>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={parameters.lines}
            onChange={(e) => handleSliderChange("lines", e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>500</span>
            <span>5000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Line Opacity: {parameters.lineOpacity}</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={parameters.lineOpacity}
            onChange={(e) => handleFloatChange("lineOpacity", e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1</span>
            <span>1.0</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Edge Threshold: {parameters.threshold}</label>
          <input
            type="range"
            min="50"
            max="200"
            value={parameters.threshold}
            onChange={(e) => handleSliderChange("threshold", e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50</span>
            <span>200</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
          <h4 className="font-medium text-blue-800 mb-2">Algorithm Info:</h4>
          <ul className="text-blue-700 space-y-1">
            <li>• Uses advanced edge detection (Sobel)</li>
            <li>• Applies Gaussian blur for noise reduction</li>
            <li>• Smart connection scoring with coverage tracking</li>
            <li>• Optimized for realistic string art results</li>
          </ul>
        </div>

        <button
          onClick={onGenerate}
          disabled={!hasImage || isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Generate String Art
            </>
          )}
        </button>
      </div>
    </div>
  )
}
