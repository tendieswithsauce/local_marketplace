// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredHub, setPreferredHub] = useState('Edmonton - Downtown Hub')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setFullName(data.full_name || '')
          setPhone(data.phone || '')
          setPreferredHub(data.preferred_hub || 'Edmonton - Downtown Hub')
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMsg('')

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        phone,
        preferred_hub: preferredHub,
        updated_at: new Date().toISOString()
      })

      if (error) {
        setStatusMsg('Error updating profile: ' + error.message)
      } else {
        setStatusMsg('Profile updated successfully!')
      }
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-center">Loading profile...</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

        {statusMsg && (
          <div className="mb-4 p-3 text-sm bg-gray-100 rounded-lg text-gray-800">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Exchange Hub</label>
            <select
              value={preferredHub}
              onChange={(e) => setPreferredHub(e.target.value)}
              className="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            >
              <option value="Edmonton - Downtown Hub">Edmonton - Downtown Hub</option>
              <option value="Edmonton - West Hub">Edmonton - West Hub</option>
              <option value="Edmonton - South Hub">Edmonton - South Hub</option>
              <option value="Edmonton - East Hub">Edmonton - East Hub</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition mt-4"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}