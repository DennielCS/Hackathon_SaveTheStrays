'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Report {
  id: string
  timestamp: string
  imageData: string
  gpsCoordinates: {
    latitude: number
    longitude: number
  }
  triageTags: string[]
  priorityScore: number
  readableAddress: string
}

export default function ShelterDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reports')
      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }
      const data = await response.json()
      setReports(data.reports || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(reportId)
      const response = await fetch(`/api/reports?id=${reportId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete report')
      }

      // Remove the report from the list
      setReports(reports.filter(report => report.id !== reportId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete report')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getPriorityColor = (score: number) => {
    if (score >= 4) return '#e74c3c' // Red - High priority
    if (score >= 3) return '#f39c12' // Orange - Medium-high
    if (score >= 2) return '#f1c40f' // Yellow - Medium
    return '#95a5a6' // Gray - Low
  }

  return (
    <main className="container">
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          color: '#2c3e50',
          margin: 0,
        }}>
          Shelter Dashboard
        </h1>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.95rem',
          }}
        >
          ← New Report
        </Link>
      </div>

      {isLoading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#7f8c8d',
        }}>
          Loading reports...
        </div>
      ) : error ? (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          ⚠️ {error}
        </div>
      ) : reports.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
            No reports yet. Reports will appear here sorted by priority.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '1.5rem',
                borderLeft: `4px solid ${getPriorityColor(report.priorityScore)}`,
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                {/* Header with Priority Score and Delete Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}>
                  <div>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      backgroundColor: getPriorityColor(report.priorityScore),
                      color: 'white',
                      borderRadius: '20px',
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      marginBottom: '0.5rem',
                    }}>
                      Priority: {report.priorityScore}/5
                    </div>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#7f8c8d',
                      marginTop: '0.25rem',
                    }}>
                      {formatDate(report.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingId === report.id}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: deletingId === report.id ? '#95a5a6' : '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: deletingId === report.id ? 'not-allowed' : 'pointer',
                      opacity: deletingId === report.id ? 0.6 : 1,
                      transition: 'all 0.2s',
                    }}
                    title="Delete this report"
                  >
                    {deletingId === report.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>

                {/* Image Preview */}
                <div style={{
                  textAlign: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '1rem',
                }}>
                  <img
                    src={report.imageData}
                    alt="Animal report"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '250px',
                      borderRadius: '8px',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Triage Tags */}
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '0.5rem',
                  }}>
                    AI Triage Tags:
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}>
                    {report.triageTags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#ecf0f1',
                          color: '#2c3e50',
                          borderRadius: '16px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location Info */}
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#ecf0f1',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    📍 Location:
                  </div>
                  <div style={{ color: '#34495e' }}>
                    {report.readableAddress}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#7f8c8d',
                    marginTop: '0.25rem',
                  }}>
                    Lat: {report.gpsCoordinates.latitude.toFixed(6)}, 
                    Lng: {report.gpsCoordinates.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        padding: '1rem',
        backgroundColor: '#fff',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#7f8c8d',
      }}>
        Total Reports: {reports.length} | 
        High Priority (4-5): {reports.filter(r => r.priorityScore >= 4).length}
      </div>
    </main>
  )
}

