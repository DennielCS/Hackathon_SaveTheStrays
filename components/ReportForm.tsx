'use client'

import { useState, useRef } from 'react'

interface GPSLocation {
  latitude: number
  longitude: number
}

export default function ReportForm() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const captureGPSLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser')
      return
    }

    setIsLoadingLocation(true)
    setErrorMessage('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLoadingLocation(false)
      },
      (error) => {
        setErrorMessage(`Failed to get location: ${error.message}`)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!image) {
      setErrorMessage('Please select an image')
      return
    }

    if (!gpsLocation) {
      setErrorMessage('Please capture your GPS location')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSubmitStatus('idle')

    try {
      // Convert image to base64 for submission
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result as string

        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: base64Image,
            gpsCoordinates: gpsLocation,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to submit report' }))
          throw new Error(errorData.error || `Failed to submit report (${response.status})`)
        }

        const result = await response.json()
        setSubmitStatus('success')
        
        // Reset form
        setImage(null)
        setImagePreview(null)
        setGpsLocation(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      reader.readAsDataURL(image)
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      maxWidth: '100%',
      margin: '0 auto',
      padding: '1.5rem',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <form onSubmit={handleSubmit}>
        {/* Image Upload Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="image-upload"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.95rem',
              color: '#2c3e50',
            }}
          >
            Photo of Animal
          </label>
          <input
            ref={fileInputRef}
            id="image-upload"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
             {image ? 'Change Photo' : 'Take/Select Photo'}
          </button>
          {imagePreview && (
            <div style={{
              marginTop: '1rem',
              textAlign: 'center',
            }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>

        {/* GPS Location Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.95rem',
              color: '#2c3e50',
            }}
          >
            Location
          </label>
          <button
            type="button"
            onClick={captureGPSLocation}
            disabled={isLoadingLocation}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: gpsLocation ? '#27ae60' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoadingLocation ? 'wait' : 'pointer',
              opacity: isLoadingLocation ? 0.7 : 1,
            }}
          >
            {isLoadingLocation
              ? ' Getting Location...'
              : gpsLocation
              ? ' Location Captured'
              : ' Capture GPS Location'}
          </button>
          {gpsLocation && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              backgroundColor: '#ecf0f1',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: '#34495e',
            }}>
              <strong>Lat:</strong> {gpsLocation.latitude.toFixed(6)}<br />
              <strong>Lng:</strong> {gpsLocation.longitude.toFixed(6)}
            </div>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#efe',
            color: '#3c3',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}>
             Report submitted successfully!
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !image || !gpsLocation}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: isSubmitting || !image || !gpsLocation ? '#95a5a6' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isSubmitting || !image || !gpsLocation ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || !image || !gpsLocation ? 0.6 : 1,
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}

