'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { isAdSenseEnabled, getAdSenseClient } from '@/lib/ads'

interface AdContextType {
  isEnabled: boolean
  clientId: string | null
}

const AdContext = createContext<AdContextType>({
  isEnabled: false,
  clientId: null,
})

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    setIsEnabled(isAdSenseEnabled())
    setClientId(getAdSenseClient())
  }, [])

  return (
    <AdContext.Provider value={{ isEnabled, clientId }}>
      {children}
    </AdContext.Provider>
  )
}

export function useAds() {
  return useContext(AdContext)
}


