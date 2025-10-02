'use client'

import { useAds } from './AdProvider'

interface AdSlotProps {
  slot: string
  format?: string
  className?: string
}

export function AdSlot({ slot, format = 'auto', className = '' }: AdSlotProps) {
  const { isEnabled, clientId } = useAds()

  if (!isEnabled || !clientId) {
    return null
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}


