import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Extract agent ID from URL if full URL is provided
    let cleanAgentId = agentId;
    if (agentId.includes('agent_id=')) {
      const match = agentId.match(/agent_id=([^&]+)/);
      cleanAgentId = match ? match[1] : agentId;
    } else if (agentId.includes('/')) {
      // If it's a URL path, extract the last segment
      cleanAgentId = agentId.split('/').pop() || agentId;
    }

    console.log('Creating ElevenLabs session for agent:', cleanAgentId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${cleanAgentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      // Provide user-friendly error messages
      if (response.status === 404) {
        throw new Error('Agent not found. Please create a Conversational AI agent in your ElevenLabs dashboard first, then copy its Agent ID.');
      }
      
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('Session created successfully');

    return new Response(
      JSON.stringify({ signedUrl: data.signed_url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating ElevenLabs session:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
