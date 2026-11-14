// app/listings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HUBS, hubName } from '@/lib/hubs'
import { formatCents } from '@/lib/money'
import { MapPin, Home as HomeIcon } from 'lucide-react'

const LISTING_COLUMNS =
  'id, title, listing_type, location_hub, image_paths, buy_now_price_cents, starting_price_cents, current_bid_cents, ends_at'

interface Listing {
  id: number
  title: string
  listing_type: 'fixed' | 'auction'
  location_hub: string
  image_paths: string[]
  buy_now_price_cents: number | null
  starting_price_cents: number | null
  current_bid_cents: number | null
  ends_at: string | null
}

const ALL_HUBS = 'all'

function displayPriceCents(item: Listing): number {
  if (item.listing_type === 'auction') {
    return item.current_bid_cents ?? item.starting_price_cents ?? 0
  }
  return item.buy_now_price_cents ?? 0
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>(ALL_HUBS)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const photoUrl = (path: string) =>
    supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      let query = supabase
        .from('listings')
        .select(LISTING_COLUMNS)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (selectedLocation !== ALL_HUBS) {
        query = query.eq('location_hub', selectedLocation)
      }

      const { data } = await query
      if (data) setListings(data)
      setLoading(false)
    }

    fetchListings()
  }, [selectedLocation])

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E293B] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center -space-x-1">
            <span className="w-4 h-4 rounded-t-full bg-[#F26B5B] inline-block" />
            <span className="w-4 h-4 rounded-t-full bg-[#0E4D5C] inline-block" />
            <span className="w-4 h-4 rounded-t-full bg-[#F4A261] inline-block" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#F26B5B]">
            Blockparty
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#1E293B]">
          <Link href="/listings" className="text-[#F26B5B] transition">
            Browse Local
          </Link>
          <Link href="/listings?type=auction" className="hover:text-[#F26B5B] transition">
            Active Auctions
          </Link>
          <Link href="/#how-it-works" className="hover:text-[#F26B5B] transition">
            How It Works
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-full border-2 border-[#0E4D5C] text-[#0E4D5C] hover:bg-[#0E4D5C] hover:text-white transition"
          >
            Sign In / Join
          </Link>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Header & Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A8D5BA]/40 text-[#0E4D5C] text-xs font-bold uppercase tracking-wider mb-2">
              <HomeIcon className="w-3.5 h-3.5" /> Public Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight">
              Treasures Around You
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Browse geo-local listings openly. Create an account when you&apos;re ready to bid or buy.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2.5 border-2 border-[#0E4D5C]/20 rounded-2xl shadow-sm">
            <MapPin className="w-5 h-5 text-[#F26B5B]" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent focus:outline-none text-sm font-bold text-[#0E4D5C]"
            >
              <option value={ALL_HUBS}>All Hubs</option>
              {HUBS.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-[#A8D5BA]/40 text-[#0E4D5C] flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No active listings in this hub</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Be the first neighbor to list an item or try selecting &quot;All Hubs&quot;.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#F26B5B] text-white font-bold text-sm shadow-md hover:bg-[#e05848] transition"
            >
              Start an Auction
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  {item.image_paths?.[0] ? (
                    <img
                      src={photoUrl(item.image_paths[0])}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image Provided
                    </div>
                  )}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                      item.listing_type === 'auction'
                        ? 'bg-[#F26B5B] text-white'
                        : 'bg-[#0E4D5C] text-white'
                    }`}
                  >
                    {item.listing_type === 'auction' ? 'Active Auction' : 'Buy It Now'}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-700 mt-1">
                      {item.listing_type === 'auction' ? 'Current Bid:' : 'Price:'}{' '}
                      <span className="font-extrabold text-slate-900">
                        {formatCents(displayPriceCents(item))}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F26B5B]" />
                      {hubName(item.location_hub).replace('Edmonton - ', '')}
                    </p>
                  </div>

                  <Link
                    href={`/listings/${item.id}`}
                    className="w-full block text-center py-2.5 rounded-xl bg-[#0E4D5C] text-white text-xs font-bold tracking-wide hover:bg-[#093641] transition"
                  >
                    View Details &amp; Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Deep Teal Footer */}
      <footer className="bg-[#0E4D5C] text-white py-12 px-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <span className="text-2xl font-extrabold text-[#F26B5B]">
              Blockparty
            </span>
            <p className="text-sm text-slate-200 max-w-xs">
              Built by neighbors, for neighbors. Bid, buy, and sell safely in your neighborhood.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-200">
            <Link href="/listings" className="hover:text-white transition">
              Browse Local
            </Link>
            <Link href="/listings?type=auction" className="hover:text-white transition">
              Active Auctions
            </Link>
            <Link href="/#how-it-works" className="hover:text-white transition">
              How It Works
            </Link>
            <Link href="/signup" className="hover:text-white transition">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}