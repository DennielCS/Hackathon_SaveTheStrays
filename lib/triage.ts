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
 * @param photoData - Base64 encoded image data
 * @param gpsCoordinates - GPS coordinates of the report
 * @returns Triage result with tags, priority score, and address
 */
export async function generateTriageData(
  photoData: string,
  gpsCoordinates: GPSCoordinates
): Promise<TriageResult> {
 
  const aiResult = await analyzeImageWithAI(photoData)

  
  const hasAnimalType = aiResult.tags.some(tag => tag === 'Dog' || tag === 'Cat')
  if (!hasAnimalType) {
    // Default to Dog if no animal type detected
    aiResult.tags.unshift('Niether Dog nor Cat')
  }

  // Priority Scoring Logic:
  let priorityScore = 1 // Base score

  if (aiResult.tags.includes('Apparent Injury')) {
    priorityScore += 3
  }

  if (aiResult.tags.includes('Malnourished')) {
    priorityScore += 2
  }

  // Ensure score is between 1 and 5
  priorityScore = Math.min(priorityScore, 5)

  const readableAddress = `Near ${gpsCoordinates.latitude.toFixed(4)}, ${gpsCoordinates.longitude.toFixed(4)}`

  return {
    triageTags: aiResult.tags,
    priorityScore,
    readableAddress,
  }
}

