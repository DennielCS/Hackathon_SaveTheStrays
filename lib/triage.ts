import { analyzeImageWithAI } from './aiService'

interface GPSCoordinates {
  latitude: number
  longitude: number
}

interface TriageResult {
  triageTags: string[]
  priorityScore: number
  readableAddress: string
}

/**
 * AI-driven triage analysis of an animal photo
 * Uses Groq API for image analysis with fallback to simulation
 * @param photoData - Base64 encoded image data
 * @param gpsCoordinates - GPS coordinates of the report
 * @returns Triage result with tags, priority score, and address
 */
export async function generateTriageData(
  photoData: string,
  gpsCoordinates: GPSCoordinates
): Promise<TriageResult> {
  // Use real AI to analyze the image
  // Set useSimulation=true to force simulation mode
  const useSimulation = process.env.USE_AI_SIMULATION === 'true'
  const aiResult = await analyzeImageWithAI(photoData, useSimulation)

  // Ensure we have at least Dog or Cat
  const hasAnimalType = aiResult.tags.some(tag => tag === 'Dog' || tag === 'Cat')
  if (!hasAnimalType) {
    // Default to Dog if no animal type detected
    aiResult.tags.unshift('Dog')
  }

  // Priority Scoring Logic:
  // Score = (3 * If('Apparent Injury')) + (2 * If('Malnourished')) + 1
  let priorityScore = 1 // Base score

  if (aiResult.tags.includes('Apparent Injury')) {
    priorityScore += 3
  }

  if (aiResult.tags.includes('Malnourished')) {
    priorityScore += 2
  }

  // Ensure score is between 1 and 5
  priorityScore = Math.min(priorityScore, 5)

  // Generate readable address based on coordinates
  // In production, you'd use a geocoding API like Google Maps Geocoding
  const readableAddress = `Near ${gpsCoordinates.latitude.toFixed(4)}, ${gpsCoordinates.longitude.toFixed(4)}`

  return {
    triageTags: aiResult.tags,
    priorityScore,
    readableAddress,
  }
}

