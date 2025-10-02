'use client'

import { useAds } from './AdProvider'

export function StickySidebarAd() {
  const { isEnabled, clientId } = useAds()

  if (!isEnabled || !clientId) {
    return null
  }

  return (
    <div className="sticky-sidebar hidden lg:block">
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Advertisement</h3>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot="1234567890" // Replace with your sidebar ad slot
          data-ad-format="rectangle"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}


