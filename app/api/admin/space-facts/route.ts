import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Get all facts (for admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: facts, error } = await supabaseAdmin
      .from('space_facts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching space facts:', error)
      return NextResponse.json({ error: 'Failed to fetch space facts' }, { status: 500 })
    }

    return NextResponse.json({ facts })
  } catch (error) {
    console.error('Admin space facts GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new fact
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fact, category, source } = await request.json()

    if (!fact?.trim()) {
      return NextResponse.json({ error: 'Fact is required' }, { status: 400 })
    }

    const { data: newFact, error } = await supabaseAdmin
      .from('space_facts')
      .insert({
        fact: fact.trim(),
        category: category || 'general',
        source: source?.trim() || null,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating space fact:', error)
      return NextResponse.json({ error: 'Failed to create space fact' }, { status: 500 })
    }

    return NextResponse.json({ fact: newFact }, { status: 201 })
  } catch (error) {
    console.error('Admin space facts POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing fact
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, fact, category, source, is_active } = await request.json()

    if (!id || !fact?.trim()) {
      return NextResponse.json({ error: 'ID and fact are required' }, { status: 400 })
    }

    const { data: updatedFact, error } = await supabaseAdmin
      .from('space_facts')
      .update({
        fact: fact.trim(),
        category: category || 'general',
        source: source?.trim() || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating space fact:', error)
      return NextResponse.json({ error: 'Failed to update space fact' }, { status: 500 })
    }

    return NextResponse.json({ fact: updatedFact })
  } catch (error) {
    console.error('Admin space facts PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete fact
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('space_facts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting space fact:', error)
      return NextResponse.json({ error: 'Failed to delete space fact' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Space fact deleted successfully' })
  } catch (error) {
    console.error('Admin space facts DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 