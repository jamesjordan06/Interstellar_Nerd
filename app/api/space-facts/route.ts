import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'daily' // daily, random, or all

    // Get all active space facts
    const { data: facts, error } = await supabaseAdmin
      .from('space_facts')
      .select('id, fact, category, source')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching space facts:', error)
      return NextResponse.json({ error: 'Failed to fetch space facts' }, { status: 500 })
    }

    if (!facts || facts.length === 0) {
      return NextResponse.json({ 
        fact: "🌌 The universe is full of wonders waiting to be discovered!",
        category: "general",
        source: "Default fact"
      })
    }

    let selectedFact
    
    switch (mode) {
      case 'random':
        // Return a random fact
        const randomIndex = Math.floor(Math.random() * facts.length)
        selectedFact = facts[randomIndex]
        break
      
      case 'all':
        // Return all facts for admin purposes
        return NextResponse.json({ facts })
      
      case 'daily':
      default:
        // Return fact based on day of year for true daily rotation
        const today = new Date()
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
        const factIndex = dayOfYear % facts.length
        selectedFact = facts[factIndex]
        break
    }

    return NextResponse.json({
      fact: selectedFact.fact,
      category: selectedFact.category,
      source: selectedFact.source,
      id: selectedFact.id
    })

  } catch (error) {
    console.error('Space facts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 