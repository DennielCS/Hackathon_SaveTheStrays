/*
 * AI Service for Image Analysis
 * Uses Groq API for fast inference with vision models
 */

interface AIAnalysisResult {
  tags: string[]
  confidence: number
}

/*
 * Analyze image using Groq API
 */
export async function analyzeImageWithAI(
  imageBase64: string
): Promise<AIAnalysisResult> {
  // Check if Groq API key is configured
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  // Ensure image has data URL prefix
  const imageUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`

  // Use Groq's chat completions API
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
    throw new Error(`Groq API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content
  
  if (!content) {
    throw new Error('Groq API returned empty response')
  }

  // Parse JSON response (handle markdown code blocks if present)
  let jsonContent = content.trim()
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  }

  let analysis
  try {
    analysis = JSON.parse(jsonContent)
  } catch (parseError) {
    throw new Error(`Failed to parse Groq API response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}`)
  }

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

  if (tags.length === 0) {
    throw new Error('Groq API did not detect any valid animal information')
  }

  return {
    tags,
    confidence: 0.85,
  }
}

