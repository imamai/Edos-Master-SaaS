import { Metadata } from 'next'
import ProcurementClient from '@/components/procurement/ProcurementClient'

export const metadata: Metadata = { title: 'Procurement' }

export default function ProcurementPage() {
  return (
    <div className="p-6">
      <ProcurementClient />
    </div>
  )
}
