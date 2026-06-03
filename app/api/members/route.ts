import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DEFAULT_MEMBERS } from '@/lib/utils'

export async function GET() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data || data.length === 0) {
    const { data: seeded, error: seedErr } = await supabase
      .from('members')
      .insert(DEFAULT_MEMBERS.map(m => ({ name: m.name, color: m.color, maintenance_calories: 2000 })))
      .select()
    if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 })
    return NextResponse.json(seeded)
  }
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, color, maintenance_calories } = body
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const { data, error } = await supabase
    .from('members')
    .insert({ name, color: color || '#64748b', maintenance_calories: maintenance_calories || 2000 })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const body = await req.json()
  const { id, name, color, maintenance_calories } = body
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const { data, error } = await supabase
    .from('members')
    .update({ name, color, maintenance_calories })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const { error } = await supabase.from('members').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
