import { NextRequest, NextResponse } from 'next/server'
import { generateTriageData } from '@/lib/triage'
import { saveReport, deleteReport } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, gpsCoordinates } = body

    if (!imageData || !gpsCoordinates) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData and gpsCoordinates' },
        { status: 400 }
      )
    }

    if (!gpsCoordinates.latitude || !gpsCoordinates.longitude) {
      return NextResponse.json(
        { error: 'Invalid GPS coordinates' },
        { status: 400 }
      )
    }

    // Generate triage data using AI analysis
    const triageResult = await generateTriageData(imageData, gpsCoordinates)

    // Save report to database
    const report = saveReport({
      imageData,
      gpsCoordinates,
      triageTags: triageResult.triageTags,
      priorityScore: triageResult.priorityScore,
      readableAddress: triageResult.readableAddress,
    })

    return NextResponse.json({
      success: true,
      reportId: report.id,
      triageResult,
    })
  } catch (error) {
    console.error('Error processing report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { getAllReports } = await import('@/lib/database')
    const reports = getAllReports()
    
    // Sort by priority score (descending)
    const sortedReports = reports.sort((a, b) => b.priorityScore - a.priorityScore)
    
    return NextResponse.json({ reports: sortedReports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing report ID' },
        { status: 400 }
      )
    }

    const success = deleteReport(reportId)

    if (!success) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

