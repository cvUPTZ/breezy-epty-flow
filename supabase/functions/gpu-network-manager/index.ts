import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const clients = new Map<string, WebSocket>();

function broadcast(message: object) {
  const payload = JSON.stringify(message);
  for (const client of clients.values()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

serve(async (req: Request) => {
  if (req.headers.get('upgrade')?.toLowerCase() === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(req);
    const clientId = crypto.randomUUID();
    clients.set(clientId, socket);

    socket.onopen = () => console.log(`[ws] Client ${clientId} connected`);
    socket.onclose = () => {
      console.log(`[ws] Client ${clientId} disconnected`);
      clients.delete(clientId);
    };
    socket.onerror = (e) => {
      console.error(`[ws] Client ${clientId} error:`, e);
      clients.delete(clientId);
    };

    return response;
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // Pattern for matching /gpu-nodes
  const nodesPattern = new URLPattern({ pathname: '/gpu-network-manager/gpu-nodes' });
  // Pattern for matching /gpu-nodes/:id
  const nodeIdPattern = new URLPattern({ pathname: '/gpu-network-manager/gpu-nodes/:id' });
  // Pattern for matching /gpu-nodes/:id/heartbeat
  const nodeHeartbeatPattern = new URLPattern({ pathname: '/gpu-network-manager/gpu-nodes/:id/heartbeat' });
  // Pattern for matching /gpu-stats
  const statsPattern = new URLPattern({ pathname: '/gpu-network-manager/gpu-stats' });

  const nodesMatch = nodesPattern.exec(url);
  const nodeIdMatch = nodeIdPattern.exec(url);
  const nodeHeartbeatMatch = nodeHeartbeatPattern.exec(url);
  const statsMatch = statsPattern.exec(url);

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // GET /gpu-nodes
    if (nodesMatch && req.method === 'GET') {
      const { data, error } = await supabase.from('gpu_nodes').select('id, name, endpoint, status, gpu_info, performance, capabilities, location, last_heartbeat, priority, created_at, owner_id');
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /gpu-nodes
    if (nodesMatch && req.method === 'POST') {
      const nodeData = await req.json();
      const { data, error } = await supabase.from('gpu_nodes').insert(nodeData).select().single();
      if (error) throw error;
      broadcast({ type: 'node_added', payload: data });
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // DELETE /gpu-nodes/:id
    if (nodeIdMatch && req.method === 'DELETE') {
      const { id } = nodeIdMatch.pathname.groups;
      const { data, error } = await supabase.from('gpu_nodes').delete().eq('id', id).select().single();
      if (error) throw error;
      broadcast({ type: 'node_removed', payload: { id } });
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /gpu-nodes/:id/heartbeat
    if (nodeHeartbeatMatch && req.method === 'POST') {
        const { id } = nodeHeartbeatMatch.pathname.groups;
        const { status, performance } = await req.json();

        const { data, error } = await supabase
            .from('gpu_nodes')
            .update({
                last_heartbeat: new Date().toISOString(),
                status,
                performance
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        broadcast({ type: 'node_updated', payload: data });
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    // GET /gpu-stats
    if (statsMatch && req.method === 'GET') {
        const { data, error } = await supabase.from('gpu_nodes').select('status, performance');
        if (error) throw error;

        const stats = {
            totalNodes: data.length,
            onlineNodes: data.filter(n => n.status === 'online').length,
            busyNodes: data.filter(n => n.status === 'busy').length,
            averageUtilization: data.length > 0
                ? data.reduce((acc, n) => acc + (n.performance?.utilization || 0), 0) / data.length
                : 0,
        };

        return new Response(JSON.stringify(stats), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });

  } catch (err) {
    console.error(err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
