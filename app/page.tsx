// app/page.tsx
import Link from 'next/link'
import { ArrowRight, ShieldCheck, MapPin, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="w-full bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Marketplace</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/listings" 
            className="text-sm font-medium text-gray-600 hover:text-black transition"
          >
            Browse Listings
          </Link>
          <Link 
            href="/signup" 
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Sign In / Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border text-xs font-semibold text-gray-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Escrow Protected & Local Hub Verified
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
          Buy & Sell Locally with Absolute Trust
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          The peer-to-peer marketplace designed for fast local trading. Funds are locked safely in escrow until you verify your item in person at a designated local hub.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link 
            href="/listings" 
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition shadow-md"
          >
            Browse Local Marketplace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            List an Item
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <ShieldCheck className="w-6 h-6 text-black" />
            <h3 className="font-bold text-gray-900">Escrow Security</h3>
            <p className="text-sm text-gray-500">Payments are held safely until both parties confirm physical handoff.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <MapPin className="w-6 h-6 text-black" />
            <h3 className="font-bold text-gray-900">Local Hub Pickups</h3>
            <p className="text-sm text-gray-500">Filter active listings directly by regional pickup hubs in your city.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <Zap className="w-6 h-6 text-black" />
            <h3 className="font-bold text-gray-900">Instant Release</h3>
            <p className="text-sm text-gray-500">Sellers enter the 6-digit buyer code at pickup to instantly release funds.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 border-t text-xs text-gray-400">
        Local Recommerce Marketplace MVP &copy; 2026
      </footer>
    </div>
  )
}