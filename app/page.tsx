import ReportForm from '@/components/ReportForm'

export default function Home() {
  return (
    <main className="container">
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        fontSize: '1.75rem',
        color: '#844200ff'
      }}>
         Save the Strays
      </h1>
      <ReportForm />
    </main>
  )
}

