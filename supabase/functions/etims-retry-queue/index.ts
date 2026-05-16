// Supabase Edge Function: etims-retry-queue
// Processes the etims_queue table – retries failed submissions.
// Triggered by pg_cron every 5 minutes (configure in Supabase Dashboard).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Fetch items due for retry (up to 20 at a time)
  const { data: queue } = await supabase
    .from('etims_queue')
    .select('id, tenant_id, sale_id, attempt_count, max_attempts')
    .in('status', ['pending', 'failed'])
    .lte('next_attempt_at', new Date().toISOString())
    .lt('attempt_count', supabase.rpc ? 5 : 5)
    .order('next_attempt_at')
    .limit(20)

  if (!queue?.length) {
    return new Response(JSON.stringify({ processed: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const submitUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/etims-submit-invoice`
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const results = await Promise.allSettled(queue.map(async (item) => {
    // Mark as processing
    await supabase.from('etims_queue').update({
      status:          'processing',
      last_attempt_at: new Date().toISOString(),
      attempt_count:   item.attempt_count + 1,
    }).eq('id', item.id)

    try {
      const res = await fetch(submitUrl, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ saleId: item.sale_id, tenantId: item.tenant_id }),
      })

      const json = await res.json() as { ok?: boolean; error?: string }

      if (json.ok) {
        await supabase.from('etims_queue').update({ status: 'done', last_error: null }).eq('id', item.id)
      } else {
        const nextAttempt = new Date(Date.now() + backoffMs(item.attempt_count + 1))
        const isFinal     = item.attempt_count + 1 >= item.max_attempts
        await supabase.from('etims_queue').update({
          status:          isFinal ? 'failed' : 'pending',
          last_error:      json.error || 'Unknown error',
          next_attempt_at: nextAttempt.toISOString(),
        }).eq('id', item.id)
      }
      return { id: item.id, ok: json.ok }
    } catch (err) {
      const nextAttempt = new Date(Date.now() + backoffMs(item.attempt_count + 1))
      const isFinal     = item.attempt_count + 1 >= item.max_attempts
      await supabase.from('etims_queue').update({
        status:          isFinal ? 'failed' : 'pending',
        last_error:      String(err),
        next_attempt_at: nextAttempt.toISOString(),
      }).eq('id', item.id)
      return { id: item.id, ok: false, error: String(err) }
    }
  }))

  const succeeded = results.filter((r) => r.status === 'fulfilled' && (r.value as Record<string, unknown>).ok).length
  const failed    = results.length - succeeded

  return new Response(JSON.stringify({ processed: results.length, succeeded, failed }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})

// Exponential back-off: 2min, 5min, 15min, 30min, 60min
function backoffMs(attempt: number): number {
  const minutes = [2, 5, 15, 30, 60]
  return (minutes[Math.min(attempt - 1, minutes.length - 1)] || 60) * 60 * 1000
}
