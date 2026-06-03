/*
 Local proxy to generate signed upload URLs using Supabase service role key.
 Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment and run:
   node server/signedUploadProxy.js

 This exposes POST /api/signed-upload
 Body: { path: string, expiresIn?: number }
 Response: { uploadUrl, publicUrl }
*/

import express from 'express'
import bodyParser from 'body-parser'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(bodyParser.json())

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env before running')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = 'submissions'

app.post('/api/signed-upload', async (req, res) => {
  try {
    const { path, expiresIn = 60 } = req.body
    if (!path) return res.status(400).json({ error: 'path required' })

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path, expiresIn)
    if (error) return res.status(500).json({ error: error.message })

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(path)}`
    res.json({ uploadUrl: data.signedUrl, publicUrl })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Signed upload proxy running at http://localhost:${port}`))
