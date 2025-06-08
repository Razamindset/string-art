export async function processImageToStringArt(imageElement, parameters) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
  
      // Set canvas size
      const size = parameters.canvasSize
      canvas.width = size
      canvas.height = size
  
      // Draw and process image
      ctx.drawImage(imageElement, 0, 0, size, size)
      const imageData = ctx.getImageData(0, 0, size, size)
  
      // Step 1: Convert to grayscale FIRST
      const grayscaleData = convertToGrayscale(imageData)
      
      // Step 2: Apply all other processing on grayscale data
      const processedData = processGrayscaleImageAdvanced(grayscaleData, parameters)
  
      // Generate pins around the circle
      const pins = generatePins(parameters.pins, size)
  
      // Generate string connections using advanced algorithm
      const connections = generateConnectionsAdvanced(pins, processedData, parameters, size)
  
      // Simulate processing delay for better UX
      setTimeout(() => {
        resolve({
          pins,
          connections,
          processedImage: processedData,
          grayscaleImage: grayscaleData, // Include grayscale for preview
        })
      }, 1500)
    })
  }
  
  function convertToGrayscale(imageData) {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    // Create grayscale image data
    const grayscaleImageData = new ImageData(width, height)
    const grayscalePixels = grayscaleImageData.data
    
    // Also create float array for processing
    const grayscaleFloat = new Float32Array(width * height)
  
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4
      
      // Use luminance formula for better grayscale conversion
      // This gives more weight to green (which human eyes are most sensitive to)
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      
      // Store in float array for processing
      grayscaleFloat[idx] = gray
      
      // Store in ImageData for preview
      grayscalePixels[i] = gray     // R
      grayscalePixels[i + 1] = gray // G  
      grayscalePixels[i + 2] = gray // B
      grayscalePixels[i + 3] = 255  // A (full opacity)
    }
  
    return {
      imageData: grayscaleImageData,
      floatData: grayscaleFloat,
      width,
      height,
    }
  }
  
  function processGrayscaleImageAdvanced(grayscaleData, parameters) {
    const { floatData, width, height } = grayscaleData
  
    console.log("Processing grayscale image...")
  
    // Step 1: Apply Gaussian blur to reduce noise
    console.log("Applying Gaussian blur...")
    const blurred = applyGaussianBlur(floatData, width, height, 1.2)
  
    // Step 2: Enhance contrast on grayscale data
    console.log("Enhancing contrast...")
    const enhanced = enhanceContrast(blurred, 1.8)
  
    // Step 3: Apply histogram equalization for better contrast distribution
    console.log("Applying histogram equalization...")
    const equalized = applyHistogramEqualization(enhanced, width, height)
  
    // Step 4: Apply Sobel edge detection
    console.log("Applying Sobel edge detection...")
    const edges = applySobelEdgeDetection(equalized, width, height)
  
    // Step 5: Apply non-maximum suppression to thin edges
    console.log("Applying non-maximum suppression...")
    const thinned = applyNonMaximumSuppression(edges, equalized, width, height)
  
    // Step 6: Create circular mask
    console.log("Applying circular mask...")
    const masked = applyCircularMask(thinned, width, height)
  
    // Step 7: Apply additional smoothing to the final result
    console.log("Final smoothing...")
    const smoothed = applyGaussianBlur(masked, width, height, 0.8)
  
    // Step 8: Invert for string art (dark areas should be high values)
    const inverted = new Float32Array(smoothed.length)
    for (let i = 0; i < smoothed.length; i++) {
      inverted[i] = 255 - smoothed[i]
    }
  
    console.log("Image processing complete!")
  
    return {
      data: inverted,
      width,
      height,
    }
  }
  
  function applyHistogramEqualization(data, width, height) {
    // Calculate histogram
    const histogram = new Array(256).fill(0)
    for (let i = 0; i < data.length; i++) {
      const value = Math.floor(Math.max(0, Math.min(255, data[i])))
      histogram[value]++
    }
  
    // Calculate cumulative distribution function
    const cdf = new Array(256)
    cdf[0] = histogram[0]
    for (let i = 1; i < 256; i++) {
      cdf[i] = cdf[i - 1] + histogram[i]
    }
  
    // Normalize CDF
    const totalPixels = width * height
    const normalizedCdf = cdf.map(value => (value / totalPixels) * 255)
  
    // Apply equalization
    const result = new Float32Array(data.length)
    for (let i = 0; i < data.length; i++) {
      const value = Math.floor(Math.max(0, Math.min(255, data[i])))
      result[i] = normalizedCdf[value]
    }
  
    return result
  }
  
  function applyNonMaximumSuppression(edges, gradients, width, height) {
    const result = new Float32Array(edges.length)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const currentEdge = edges[idx]
        
        if (currentEdge === 0) {
          result[idx] = 0
          continue
        }
  
        // Calculate gradient direction
        const gx = gradients[(y * width) + (x + 1)] - gradients[(y * width) + (x - 1)]
        const gy = gradients[((y + 1) * width) + x] - gradients[((y - 1) * width) + x]
        
        let angle = Math.atan2(gy, gx) * 180 / Math.PI
        if (angle < 0) angle += 180
  
        // Determine neighbors to compare based on gradient direction
        let neighbor1, neighbor2
        
        if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
          // Horizontal
          neighbor1 = edges[y * width + (x - 1)]
          neighbor2 = edges[y * width + (x + 1)]
        } else if (angle >= 22.5 && angle < 67.5) {
          // Diagonal /
          neighbor1 = edges[(y - 1) * width + (x + 1)]
          neighbor2 = edges[(y + 1) * width + (x - 1)]
        } else if (angle >= 67.5 && angle < 112.5) {
          // Vertical
          neighbor1 = edges[(y - 1) * width + x]
          neighbor2 = edges[(y + 1) * width + x]
        } else {
          // Diagonal \
          neighbor1 = edges[(y - 1) * width + (x - 1)]
          neighbor2 = edges[(y + 1) * width + (x + 1)]
        }
  
        // Suppress if not a local maximum
        if (currentEdge >= neighbor1 && currentEdge >= neighbor2) {
          result[idx] = currentEdge
        } else {
          result[idx] = 0
        }
      }
    }
  
    return result
  }
  
  function applyGaussianBlur(data, width, height, sigma) {
    const kernel = createGaussianKernel(sigma)
    const kernelSize = kernel.length
    const halfKernel = Math.floor(kernelSize / 2)
    const result = new Float32Array(data.length)
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0
        let weightSum = 0
  
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const px = Math.max(0, Math.min(width - 1, x + kx))
            const py = Math.max(0, Math.min(height - 1, y + ky))
            const weight = kernel[ky + halfKernel] * kernel[kx + halfKernel]
  
            sum += data[py * width + px] * weight
            weightSum += weight
          }
        }
  
        result[y * width + x] = sum / weightSum
      }
    }
  
    return result
  }
  
  function createGaussianKernel(sigma) {
    const size = Math.ceil(sigma * 3) * 2 + 1
    const kernel = new Float32Array(size)
    const center = Math.floor(size / 2)
    let sum = 0
  
    for (let i = 0; i < size; i++) {
      const x = i - center
      kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma))
      sum += kernel[i]
    }
  
    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum
    }
  
    return kernel
  }
  
  function enhanceContrast(data, factor) {
    const result = new Float32Array(data.length)
  
    // Find min and max values for better contrast stretching
    let min = Infinity, max = -Infinity
    for (let i = 0; i < data.length; i++) {
      min = Math.min(min, data[i])
      max = Math.max(max, data[i])
    }
  
    const range = max - min
    if (range === 0) return data
  
    for (let i = 0; i < data.length; i++) {
      // Normalize to 0-1
      const normalized = (data[i] - min) / range
      
      // Apply power law transformation
      const enhanced = Math.pow(normalized, 1 / factor)
      
      // Scale back to 0-255
      result[i] = Math.max(0, Math.min(255, enhanced * 255))
    }
  
    return result
  }
  
  function applySobelEdgeDetection(data, width, height) {
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
    const result = new Float32Array(data.length)
  
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0
  
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx)
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
  
            gx += data[idx] * sobelX[kernelIdx]
            gy += data[idx] * sobelY[kernelIdx]
          }
        }
  
        const magnitude = Math.sqrt(gx * gx + gy * gy)
        result[y * width + x] = Math.min(255, magnitude)
      }
    }
  
    return result
  }
  
  function applyCircularMask(data, width, height) {
    const result = new Float32Array(data.length)
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 15
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
  
        const idx = y * width + x
        if (distance <= radius) {
          // Apply soft falloff near edges for smoother transition
          const falloff = Math.min(1, (radius - distance + 10) / 25)
          result[idx] = data[idx] * Math.max(0, falloff)
        } else {
          result[idx] = 0
        }
      }
    }
  
    return result
  }
  
  function generatePins(numPins, canvasSize) {
    const pins = []
    const centerX = canvasSize / 2
    const centerY = canvasSize / 2
    const radius = canvasSize / 2 - 20
  
    for (let i = 0; i < numPins; i++) {
      const angle = (i / numPins) * 2 * Math.PI
      pins.push({
        id: i,
        angle: angle,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      })
    }
    return pins
  }
  
  function generateConnectionsAdvanced(pins, processedData, parameters, canvasSize) {
    const connections = []
    const numPins = pins.length
    const maxConnections = parameters.lines
  
    // Create accumulation canvas to track string density
    const accumCanvas = new Float32Array(processedData.width * processedData.height)
  
    // Track used connections to avoid duplicates
    const usedConnections = new Set()
  
    let currentPin = 0
    let iterationsWithoutImprovement = 0
    const maxIterationsWithoutImprovement = 100
  
    console.log("Starting advanced string art generation...")
  
    for (
      let connectionCount = 0;
      connectionCount < maxConnections && iterationsWithoutImprovement < maxIterationsWithoutImprovement;
      connectionCount++
    ) {
      let bestConnection = null
      let bestScore = -1
  
      // Look ahead more pins for better connections
      const searchRange = Math.min(Math.floor(numPins / 2), 150)
  
      for (let offset = 5; offset < searchRange; offset++) {
        const nextPin = (currentPin + offset) % numPins
        const connectionKey = `${Math.min(currentPin, nextPin)}-${Math.max(currentPin, nextPin)}`
  
        if (usedConnections.has(connectionKey)) continue
  
        const score = calculateAdvancedLineScore(pins[currentPin], pins[nextPin], processedData, accumCanvas, parameters)
  
        if (score > bestScore) {
          bestScore = score
          bestConnection = {
            from: currentPin,
            to: nextPin,
            score: score,
          }
        }
      }
  
      if (bestConnection && bestScore > 0.05) {
        connections.push(bestConnection)
  
        // Update accumulation canvas
        drawLineOnAccumCanvas(
          pins[bestConnection.from],
          pins[bestConnection.to],
          accumCanvas,
          processedData.width,
          processedData.height,
          parameters.lineOpacity * 255,
        )
  
        const connectionKey = `${Math.min(bestConnection.from, bestConnection.to)}-${Math.max(bestConnection.from, bestConnection.to)}`
        usedConnections.add(connectionKey)
  
        currentPin = bestConnection.to
        iterationsWithoutImprovement = 0
  
        // Progress logging
        if (connectionCount % 200 === 0) {
          console.log(`Generated ${connectionCount} connections...`)
        }
      } else {
        iterationsWithoutImprovement++
        // Jump to a strategic pin if stuck
        currentPin = findBestStartingPin(pins, processedData, accumCanvas)
      }
    }
  
    console.log(`Completed string art generation with ${connections.length} connections`)
    return connections
  }
  
  function calculateAdvancedLineScore(pin1, pin2, processedData, accumCanvas, parameters) {
    const samples = 60
    let totalScore = 0
    let validSamples = 0
  
    const dx = pin2.x - pin1.x
    const dy = pin2.y - pin1.y
    const length = Math.sqrt(dx * dx + dy * dy)
  
    // Penalize very short connections more strongly
    if (length < 80) return 0
  
    for (let i = 0; i <= samples; i++) {
      const t = i / samples
      const x = Math.round(pin1.x + dx * t)
      const y = Math.round(pin1.y + dy * t)
  
      if (x >= 0 && x < processedData.width && y >= 0 && y < processedData.height) {
        const idx = y * processedData.width + x
  
        // Score based on processed image darkness
        const imageDarkness = processedData.data[idx] / 255
  
        // Penalty for areas already covered by strings
        const currentCoverage = Math.min(1, accumCanvas[idx] / 255)
        const coveragePenalty = Math.pow(currentCoverage, 1.5)
  
        // Combined score with stronger coverage penalty
        const sampleScore = imageDarkness * (1 - coveragePenalty * 0.9)
  
        totalScore += sampleScore
        validSamples++
      }
    }
  
    if (validSamples === 0) return 0
  
    const averageScore = totalScore / validSamples
  
    // Bonus for longer lines (more efficient coverage)
    const lengthBonus = Math.min(1.3, length / 250)
  
    return averageScore * lengthBonus
  }
  
  function drawLineOnAccumCanvas(pin1, pin2, accumCanvas, width, height, intensity) {
    const dx = Math.abs(pin2.x - pin1.x)
    const dy = Math.abs(pin2.y - pin1.y)
    const steps = Math.max(dx, dy)
  
    if (steps === 0) return
  
    const xStep = (pin2.x - pin1.x) / steps
    const yStep = (pin2.y - pin1.y) / steps
  
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(pin1.x + xStep * i)
      const y = Math.round(pin1.y + yStep * i)
  
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = y * width + x
        accumCanvas[idx] = Math.min(255, accumCanvas[idx] + intensity)
      }
    }
  }
  
  function findBestStartingPin(pins, processedData, accumCanvas) {
    let bestPin = 0
    let bestScore = -1
  
    for (let i = 0; i < pins.length; i += 3) {
      // Sample every 3rd pin for performance
      const pin = pins[i]
      const x = Math.round(pin.x)
      const y = Math.round(pin.y)
  
      if (x >= 0 && x < processedData.width && y >= 0 && y < processedData.height) {
        const idx = y * processedData.width + x
        const imageDarkness = processedData.data[idx]
        const coverage = accumCanvas[idx]
  
        // Prefer areas with high image darkness and low current coverage
        const score = imageDarkness * (1 - coverage / 255)
  
        if (score > bestScore) {
          bestScore = score
          bestPin = i
        }
      }
    }
  
    return bestPin
  }
  