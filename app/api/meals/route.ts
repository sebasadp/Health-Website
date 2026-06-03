import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  let query = supabase.from('meals').select('*').order('created_at', { ascending: false })
  if (date) query = query.eq('date', date)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { member_name, meal_type, description, photo_urls, date, calories } = body
  if (!member_name || !meal_type || !date)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const { data, error } = await supabase
    .from('meals')
    .insert({ member_name, meal_type, description, photo_urls: photo_urls || [], date, calories: calories || null })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const { error } = await supabase.from('meals').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
