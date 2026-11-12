// app/page.tsx
import Link from 'next/link'
import {
  ShieldCheck,
  UserCheck,
  Star,
  ArrowRight,
  Gavel,
  MapPin,
  Clock,
  CheckCircle2,
  Home as HomeIcon,
} from 'lucide-react'

// Sample preview items matching your concept
const FEATURED_AUCTIONS = [
  {
    id: '1',
    title: 'Retro Polaroid Camera',
    price: 45,
    type: 'Current Bid',
    timeLeft: '2h 15m',
    seller: "Sarah's Attic",
    distance: '1.2 mi',
    accent: 'bg-[#F26B5B]',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Mountain Bike',
    price: 110,
    type: 'Current Bid',
    timeLeft: '30m',
    seller: "Dave's Garage",
    distance: '0.8 mi',
    accent: 'bg-[#74B49B]',
    image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    title: 'Handmade Coffee Table',
    price: 95,
    type: 'Buy It Now',
    timeLeft: 'Instant',
    seller: 'Crafty Chloe',
    distance: '2.5 mi',
    accent: 'bg-[#F26B5B]',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    title: 'Box of Vintage Books',
    price: 18,
    type: 'Current Bid',
    timeLeft: '1h 40m',
    seller: 'Bookworm Ben',
    distance: '1.8 mi',
    accent: 'bg-[#74B49B]',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  },
]

export default function HomePage() {
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
          <Link href="/listings" className="hover:text-[#F26B5B] transition">
            Browse Local
          </Link>
          <Link href="/listings?type=auction" className="hover:text-[#F26B5B] transition">
            Active Auctions
          </Link>
          <a href="#how-it-works" className="hover:text-[#F26B5B] transition">
            How It Works
          </a>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-full border-2 border-[#0E4D5C] text-[#0E4D5C] hover:bg-[#0E4D5C] hover:text-white transition"
          >
            Sign In / Join
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-6 pb-16 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A8D5BA]/40 text-[#0E4D5C] text-xs font-bold uppercase tracking-wider">
              <HomeIcon className="w-3.5 h-3.5" /> Neighborhood Marketplace
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F26B5B]">
              Blockparty
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-[#334155]">
              The safest way to bid, buy, and sell in your neighborhood.
            </p>
          </div>

          {/* Illustrated Neighborhood Banner Card */}
          <div className="mt-10 relative max-w-4xl mx-auto rounded-3xl bg-[#A8D5BA] p-6 sm:p-10 shadow-sm border-2 border-[#0E4D5C]/10 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-left">
              <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase text-[#0E4D5C] bg-[#A8D5BA]/40 px-2.5 py-1 rounded-full">
                    Live Auction
                  </span>
                  <Gavel className="w-5 h-5 text-[#F26B5B]" />
                </div>
                <p className="font-bold text-slate-800 text-lg">Bid in Real Time</p>
                <p className="text-sm text-slate-500 mt-1">
                  Browse geo-local treasures openly. Create a free account when you&apos;re ready to bid.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center text-center py-2">
                <div className="w-20 h-20 rounded-full bg-[#0E4D5C] text-white flex items-center justify-center shadow-lg mb-3">
                  <ShieldCheck className="w-10 h-10 text-[#A8D5BA]" />
                </div>
                <span className="font-extrabold text-[#0E4D5C] text-lg">
                  100% Local &amp; Protected
                </span>
                <span className="text-xs font-medium text-[#0E4D5C]/80">
                  No shipping boxes. No sketchy meetups.
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E4D5C] text-white text-xs font-bold mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A8D5BA]" /> Pay securely
                </div>
                <p className="font-bold text-slate-800 text-lg">Escrow Held Funds</p>
                <p className="text-sm text-slate-500 mt-1">
                  Money is held safely until you inspect your item at handoff and confirm receipt.
                </p>
              </div>
            </div>
          </div>

          {/* Primary & Secondary CTAs (App Store Buttons Ignored) */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#0E4D5C] text-white font-bold text-lg shadow-md hover:bg-[#093641] transition"
            >
              Find Local Treasures <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#F26B5B] text-white font-bold text-lg shadow-md hover:bg-[#e05848] transition"
            >
              Start Your First Auction
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Public browsing is open to everyone. A verified account is required to place bids or list items.
          </p>
        </section>

        {/* Auctions Just Around the Corner */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
                Auctions Just Around the Corner
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Active listings near your neighborhood right now
              </p>
            </div>
            <Link
              href="/listings"
              className="text-sm font-bold text-[#0E4D5C] hover:text-[#F26B5B] inline-flex items-center gap-1"
            >
              View all local listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_AUCTIONS.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-700 mt-1">
                      {item.type}:{' '}
                      <span className="font-extrabold text-slate-900">
                        ${item.price}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" /> Time Left: {item.timeLeft}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F26B5B]" /> {item.seller} ({item.distance})
                    </p>
                  </div>

                  <Link
                    href={`/listings?item=${item.id}`}
                    className={`w-full block text-center py-2 rounded-lg text-white text-xs font-bold tracking-wide hover:opacity-90 transition ${item.accent}`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Pillars */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#A8D5BA]/50 border-2 border-[#0E4D5C] flex items-center justify-center text-[#0E4D5C]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1E293B]">
                Secure Escrow Payments
              </h3>
              <p className="text-sm text-slate-600 max-w-xs">
                Funds stay safely locked until you inspect the item in person and confirm everything matches the listing.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F4A261]/30 border-2 border-[#0E4D5C] flex items-center justify-center text-[#0E4D5C]">
                <UserCheck className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1E293B]">
                Verified Local Users
              </h3>
              <p className="text-sm text-slate-600 max-w-xs">
                Every bidder and seller creates an authenticated account tied to their local community.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F26B5B]/20 border-2 border-[#0E4D5C] flex items-center justify-center text-[#0E4D5C]">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#1E293B]">
                Trusted Community Reviews
              </h3>
              <p className="text-sm text-slate-600 max-w-xs">
                Build your neighborhood reputation with transparent ratings after every completed handoff.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Deep Teal Footer */}
      <footer className="bg-[#0E4D5C] text-white py-12 px-6">
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
            <a href="#how-it-works" className="hover:text-white transition">
              How It Works
            </a>
            <Link href="/signup" className="hover:text-white transition">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}