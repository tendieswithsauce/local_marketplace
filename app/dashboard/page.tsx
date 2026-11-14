// app/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle } from 'lucide-react'
import { DEFAULT_HUB, HUBS } from '@/lib/hubs'
import { dollarsToCents } from '@/lib/money'

const AUCTION_DURATIONS_DAYS = [1, 3, 5, 7] as const

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed')
  const [durationDays, setDurationDays] = useState<number>(3)
  const [locationHub, setLocationHub] = useState<string>(DEFAULT_HUB)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault()

    const priceCents = dollarsToCents(price)
    if (priceCents === null) {
      alert('Please enter a valid price greater than $0.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in to post a listing.')
      setLoading(false)
      return
    }

    // Fixed-price listings use buy_now_price_cents; auctions need a starting
    // price and an end time (enforced by a DB check constraint).
    const pricing =
      listingType === 'fixed'
        ? { buy_now_price_cents: priceCents }
        : {
            starting_price_cents: priceCents,
            ends_at: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
          }

    const { error } = await supabase.from('listings').insert({
      seller_id: user.id,
      title,
      description: description || null,
      listing_type: listingType,
      location_hub: locationHub,
      ...pricing,
    })

    if (error) {
      alert(error.message)
    } else {
      setShowModal(false)
      setTitle('')
      setDescription('')
      setPrice('')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Listing
        </button>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-bold">New Listing</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {listingType === 'auction' ? 'Starting Price ($)' : 'Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Format</label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as 'fixed' | 'auction')}
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="auction">Auction</option>
                  </select>
                </div>
              </div>

              {listingType === 'auction' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Auction Length</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="mt-1 w-full border px-3 py-2 rounded-lg"
                  >
                    {AUCTION_DURATIONS_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d} {d === 1 ? 'day' : 'days'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Pickup Hub</label>
                <select
                  value={locationHub}
                  onChange={(e) => setLocationHub(e.target.value)}
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                >
                  {HUBS.map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full border px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  {loading ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}