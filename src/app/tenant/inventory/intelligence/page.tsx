import { Metadata } from 'next'
import InventoryIntelligenceClient from '@/components/inventory/InventoryIntelligenceClient'

export const metadata: Metadata = { title: 'Inventory Intelligence' }

export default function InventoryIntelligencePage() {
  return (
    <div className="p-6">
      <InventoryIntelligenceClient />
    </div>
  )
}
