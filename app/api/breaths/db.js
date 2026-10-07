import { MongoClient } from 'mongodb'

const globalForMongo = globalThis
const DNS_OVER_HTTPS = 'https://cloudflare-dns.com/dns-query'

async function queryDns(name, type) {
  const url = new URL(DNS_OVER_HTTPS)
  url.searchParams.set('name', name)
  url.searchParams.set('type', type)
  const response = await fetch(url, { headers: { accept: 'application/dns-json' } })
  if (!response.ok) throw new Error(`DNS lookup failed for ${name}`)
  const result = await response.json()
  if (result.Status !== 0 || !Array.isArray(result.Answer)) {
    throw new Error(`DNS lookup returned no ${type} records for ${name}`)
  }
  return result.Answer
}

async function resolveSrvUri(uri) {
  const parsed = new URL(uri)
  const host = parsed.hostname
  const [srvRecords, txtRecords] = await Promise.all([
    queryDns(`_mongodb._tcp.${host}`, 'SRV'),
    queryDns(host, 'TXT'),
  ])
  const hosts = srvRecords
    .filter((record) => record.type === 33)
    .map((record) => {
      const [, , port, target] = record.data.split(/\s+/)
      return `${target.replace(/\.$/, '')}:${port}`
    })
  if (!hosts.length) throw new Error(`No MongoDB hosts found for ${host}`)

  const txt = txtRecords.find((record) => record.type === 16)
  const options = new URLSearchParams(txt?.data.replace(/^"|"$/g, '') || '')
  parsed.searchParams.forEach((value, key) => options.set(key, value))
  if (!options.has('authSource')) options.set('authSource', 'admin')
  if (!options.has('tls') && !options.has('ssl')) options.set('tls', 'true')
  if (!options.has('retryWrites')) options.set('retryWrites', 'true')
  if (!options.has('w')) options.set('w', 'majority')

  const authorityStart = uri.indexOf('://') + 3
  const userInfo = uri.slice(authorityStart, uri.indexOf('@', authorityStart))
  return `mongodb://${userInfo}@${hosts.join(',')}/?${options.toString()}`
}

async function connectMongo(uri) {
  try {
    return await new MongoClient(uri).connect()
  } catch (error) {
    if (!uri.startsWith('mongodb+srv://') || !String(error?.message).includes('querySrv')) {
      throw error
    }
    return new MongoClient(await resolveSrvUri(uri)).connect()
  }
}

export async function getBreathsCollection() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is required')

  if (globalForMongo.mongoClientPromiseVersion !== 2 || globalForMongo.mongoUri !== uri) {
    globalForMongo.mongoUri = uri
    globalForMongo.mongoClientPromiseVersion = 2
    globalForMongo.mongoClientPromise = connectMongo(uri).catch((error) => {
      globalForMongo.mongoClientPromise = undefined
      throw error
    })
  }
  const client = await globalForMongo.mongoClientPromise
  return client.db(process.env.MONGODB_DB || 'delhi_air').collection('breaths')
}