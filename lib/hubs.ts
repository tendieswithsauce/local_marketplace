// lib/hubs.ts
// Mirrors the rows seeded into public.hubs. `id` is what the database stores.
export const HUBS = [
  { id: 'edm-downtown', name: 'Edmonton - Downtown Hub' },
  { id: 'edm-west', name: 'Edmonton - West Hub' },
  { id: 'edm-south', name: 'Edmonton - South Hub' },
  { id: 'edm-east', name: 'Edmonton - East Hub' },
] as const

export type HubId = (typeof HUBS)[number]['id']

export const DEFAULT_HUB: HubId = 'edm-downtown'

export function hubName(id: string): string {
  return HUBS.find((h) => h.id === id)?.name ?? id
}
