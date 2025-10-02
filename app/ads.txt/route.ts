export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  
  if (!clientId) {
    return new Response('', { status: 404 })
  }
  
  const adsTxt = `google.com, pub-${clientId}, DIRECT, f08c47fec0942fa0`

  return new Response(adsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}


