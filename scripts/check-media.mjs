// Run against the actual deployment too: npm run check:media -- https://your-site.example
const base = process.argv[2] || 'http://localhost:3000'
for (const name of ['headphones', 'fragrance', 'watch', 'sneaker', 'camera']) {
  const response = await fetch(new URL(`/films/${name}.mp4`, base), { headers: { Range: 'bytes=0-1023' } })
  const contentRange = response.headers.get('content-range')
  if (response.status !== 206 || !contentRange?.startsWith('bytes 0-1023/') || !response.headers.get('content-type')?.includes('video/mp4')) {
    await response.body?.cancel()
    throw new Error(`${name}: host must serve video/mp4 with HTTP 206 byte ranges (got ${response.status})`)
  }
  const bytes = await response.arrayBuffer()
  if (bytes.byteLength !== 1024) throw new Error(`${name}: invalid partial response`)
  console.log(`${name}: byte-range streaming OK`)
}
