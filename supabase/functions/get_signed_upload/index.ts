// Supabase Edge Function (Deno) - get_signed_upload
// Deploy under supabase/functions/get_signed_upload
// Expects JSON body: { path: string, contentType?: string }
// Returns: { uploadUrl: string, publicUrl: string }

import { serve } from 'std/http/server'
import { createClient } from '@supabase/supabase-js'

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!supabaseUrl || !serviceKey) return new Response('Missing env', { status: 500 })

    const supabase = createClient(supabaseUrl, serviceKey)
    const body = await req.json()
    const path = body.path as string
    const expiresIn = body.expiresIn ?? 60 // seconds
    const bucket = 'submissions'

    // Create a signed upload URL (server-side). Supabase JS provides createSignedUploadUrl on server SDKs.
    // If your SDK version differs, use the appropriate storage method for signed uploads.
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, expiresIn)

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

    // Public URL (if you want a public download URL, you can generate a signed download URL separately)
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`

    return new Response(JSON.stringify({ uploadUrl: data.signedUrl, publicUrl }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
