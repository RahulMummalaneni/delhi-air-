import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function GET() {
  try {
    const { data, error } = await supabase.from('breaths').select('*').order('ts', { ascending: false }).limit(1000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, location, role, story, contact, pos, text } = body
    const payload = {
      name: name || null,
      location: location || null,
      role: role || null,
      story: story || null,
      contact: contact || null,
      lat: Array.isArray(pos) ? pos[0] : null,
      lng: Array.isArray(pos) ? pos[1] : null,
      text: text || null,
      ts: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('breaths').insert([payload])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
