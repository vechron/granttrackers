import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePrograms } from '@/lib/cache'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Skip during build process
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    return NextResponse.json({ message: 'Build time - skipping execution' })
  }
  
  try {
    console.log('🕒 Running automated grant expiration...')
    
    // Deactivate expired programs
    const expiredCount = await prisma.program.updateMany({
      where: { 
        active: true, 
        deadline: { lt: new Date() } 
      },
      data: { 
        active: false, 
        featured: false 
      }
    })
    
    console.log(`✅ Deactivated ${expiredCount.count} expired programs`)
    
    // Revalidate caches if any programs were updated
    if (expiredCount.count > 0) {
      await revalidatePrograms()
      console.log('🔄 Cache revalidated')
    }
    
    // Log health check
    await prisma.healthCheck.create({
      data: {
        name: 'expire_programs',
        ok: true,
        details: {
          expiredCount: expiredCount.count,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Grant expiration completed',
      expiredCount: expiredCount.count,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Grant expiration failed:', error)
    
    // Log failed health check
    await prisma.healthCheck.create({
      data: {
        name: 'expire_programs',
        ok: false,
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({ 
      error: 'Grant expiration failed',
      details: error.message 
    }, { status: 500 })
  }
}
