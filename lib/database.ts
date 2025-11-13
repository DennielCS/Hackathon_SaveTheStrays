import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'database', 'reports.json')

export interface Report {
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

// Ensure database directory exists
function ensureDatabaseDir() {
  const dbDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
}

// Initialize database file if it doesn't exist
function initializeDatabase() {
  ensureDatabaseDir()
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2))
  }
}

// Read all reports from database
export function getAllReports(): Report[] {
  initializeDatabase()
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading database:', error)
    return []
  }
}

// Save a new report to database
export function saveReport(report: Omit<Report, 'id' | 'timestamp'>): Report {
  initializeDatabase()
  const reports = getAllReports()
  
  const newReport: Report = {
    ...report,
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  reports.push(newReport)
  fs.writeFileSync(DB_PATH, JSON.stringify(reports, null, 2))
  
  return newReport
}

// Delete a report by ID
export function deleteReport(reportId: string): boolean {
  initializeDatabase()
  const reports = getAllReports()
  const initialLength = reports.length
  
  const filteredReports = reports.filter(report => report.id !== reportId)
  
  if (filteredReports.length === initialLength) {
    // Report not found
    return false
  }
  
  fs.writeFileSync(DB_PATH, JSON.stringify(filteredReports, null, 2))
  return true
}

