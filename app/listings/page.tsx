// app/listings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Tag } from 'lucide-react'

interface Listing {
  id: string
  title: string
  price: number
  listing_type: 'fixed' | 'auction'
  location_hub: string
  images: string[]
}

const LOCATIONS = [
  'All Hubs',
  'Edmonton - Downtown Hub',
  'Edmonton - West Hub',
  'Edmonton - South Hub',
  'Edmonton - East Hub'
]

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedLocation, setSelectedLocation] = useState('All Hubs')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      let query = supabase.from('listings').select('*').eq('status', 'active')

      if (selectedLocation !== 'All Hubs') {
        query = query.eq('location_hub', selectedLocation)
      }

      const { data } = await query
      if (data) setListings(data)
      setLoading(false)
    }

    fetchListings()
  }, [selectedLocation])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Local Marketplace</h1>
          <p className="text-gray-500 text-sm">Secure local hub pickups & escrow protection</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-2 border rounded-lg shadow-sm">
          <MapPin className="w-5 h-5 text-gray-400" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-transparent focus:outline-none text-sm font-medium text-gray-700"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500">No active listings in this location hub right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gray-100 relative">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-md ${
                  item.listing_type === 'auction' ? 'bg-amber-500 text-white' : 'bg-black text-white'
                }`}>
                  {item.listing_type === 'auction' ? 'Auction' : 'Buy Now'}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                  <div className="flex items-center text-xs text-gray-500 gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location_hub.replace('Edmonton - ', '')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}