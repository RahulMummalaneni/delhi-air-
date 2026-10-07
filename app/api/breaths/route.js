import { NextResponse } from 'next/server'
import { getBreathsCollection } from './db'

export const dynamic = 'force-dynamic'

function logDatabaseError(operation, error) {
  const message = String(error?.message || error).replace(/mongodb(?:\+srv)?:\/\/[^@\s]+@/g, 'mongodb+srv://[redacted]@')
  console.error(`MongoDB ${operation} failed:`, error?.name || 'Error', message)
}

export async function GET() {
  try {
    const collection = await getBreathsCollection()
    const [records, count] = await Promise.all([
      collection.find({}, { projection: { location: 1, lat: 1, lng: 1, text: 1, ts: 1 } }).sort({ ts: -1 }).toArray(),
      collection.countDocuments(),
    ])
    return NextResponse.json({
      records: records.map((record) => ({ ...record, _id: String(record._id) })),
      count,
    })
  } catch (error) {
    logDatabaseError('read', error)
    return NextResponse.json({ error: 'Unable to load saved responses' }, { status: 503 })
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
    const collection = await getBreathsCollection()
    const { insertedId } = await collection.insertOne(payload)
    const count = await collection.countDocuments()
    const record = {
      _id: String(insertedId),
      location: payload.location,
      lat: payload.lat,
      lng: payload.lng,
      text: payload.text,
      ts: payload.ts,
    }
    return NextResponse.json({ record, count }, { status: 201 })
  } catch (error) {
    logDatabaseError('write', error)
    return NextResponse.json({ error: 'Unable to save response' }, { status: 503 })
  }
}
