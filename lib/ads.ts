export function isAdSenseEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true'
}

export function getAdSenseClient(): string | null {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT || null
}

export function getAdSlotId(slot: string): string {
  const client = getAdSenseClient()
  if (!client) return ''
  return `${client}:${slot}`
}


