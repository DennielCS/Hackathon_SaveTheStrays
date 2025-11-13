/**
 * AI Service for Image Analysis
 * Uses Groq API for fast inference with vision models
 * Falls back to simulation if Groq API is not configured or fails
 */

interface AIAnalysisResult {
  tags: string[]
  confidence: number
}

/**
 * Analyze image using Groq API
 * Falls back to simulation if API fails or is not configured
 */
export async function analyzeImageWithAI(
  imageBase64: string,
  useSimulation: boolean = false
): Promise<AIAnalysisResult> {
  // If simulation mode, use simulation
  if (useSimulation) {
    return simulateAIAnalysis()
  }

  // Use Groq API if configured
  if (process.env.GROQ_API_KEY) {
    const groqResult = await analyzeWithGroq(imageBase64)
    if (groqResult) return groqResult
  }

  // Fallback to simulation if Groq is not configured or failed
  return simulateAIAnalysis()
}

/**
 * Analyze image using Groq API
 * Uses Llama 4 Scout or Maverick vision models for fast inference
 */
async function analyzeWithGroq(
  imageBase64: string
): Promise<AIAnalysisResult | null> {
  if (!process.env.GROQ_API_KEY) {
    return null
  }

  try {
    // Ensure image has data URL prefix
    const imageUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`

    // Use Groq's chat completions API
    // Groq vision models: meta-llama/llama-4-scout-17b-16e-instruct (faster) or meta-llama/llama-4-maverick-17b-128e-instruct (more capable)
    // See: https://console.groq.com/docs/vision
    const model = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image of an animal. Identify: 1) Animal type (Dog or Cat), 2) If there are visible injuries, 3) If the animal appears malnourished/thin, 4) If the animal is wearing a collar. Respond ONLY with a valid JSON object in this exact format: {"animalType": "Dog" or "Cat", "hasInjury": true or false, "isMalnourished": true or false, "hasCollar": true or false}',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.1, // Lower temperature for more consistent JSON output
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn('Groq API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    if (!content) return null

    // Parse JSON response (handle markdown code blocks if present)
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    }

    const analysis = JSON.parse(jsonContent)
    const tags: string[] = []

    if (analysis.animalType) {
      tags.push(analysis.animalType)
    }
    if (analysis.hasInjury === true || analysis.hasInjury === 'true') {
      tags.push('Apparent Injury')
    }
    if (analysis.isMalnourished === true || analysis.isMalnourished === 'true') {
      tags.push('Malnourished')
    }
    if (analysis.hasCollar === true || analysis.hasCollar === 'true') {
      tags.push('Lost/Wearing Collar')
    }

    return {
      tags: tags.length > 0 ? tags : ['Dog'], // Default fallback
      confidence: 0.85, // Groq is generally reliable
    }
  } catch (error) {
    console.error('Groq API error:', error)
    return null
  }
}

/**
 * Fallback simulation when Groq API is not available
 */
function simulateAIAnalysis(): AIAnalysisResult {
  const POSSIBLE_TAGS = [
    'Dog',
    'Cat',
    'Apparent Injury',
    'Malnourished',
    'Lost/Wearing Collar',
  ]

  const numTags = Math.floor(Math.random() * 2) + 2 // 2 or 3 tags
  const shuffledTags = [...POSSIBLE_TAGS].sort(() => Math.random() - 0.5)
  const selectedTags = shuffledTags.slice(0, numTags)

  return {
    tags: selectedTags,
    confidence: 0.5, // Lower confidence for simulation
  }
}

