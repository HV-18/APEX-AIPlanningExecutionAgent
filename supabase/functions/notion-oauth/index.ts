import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, action } = await req.json();
    const NOTION_CLIENT_ID = Deno.env.get("NOTION_CLIENT_ID");
    const NOTION_CLIENT_SECRET = Deno.env.get("NOTION_CLIENT_SECRET");

    if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: "Notion credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange code for access token
    if (action === "exchange") {
      const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`)}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${req.headers.get("origin")}/profile`,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      return new Response(
        JSON.stringify(tokenData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sync notes to Notion
    if (action === "sync-notes") {
      const { accessToken, notes } = await req.json();

      const results = [];
      for (const note of notes) {
        const response = await fetch("https://api.notion.com/v1/pages", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            parent: { type: "database_id", database_id: note.databaseId },
            properties: {
              title: {
                title: [{ text: { content: note.topic } }],
              },
              Subject: {
                select: { name: note.subject },
              },
            },
            children: [
              {
                object: "block",
                type: "paragraph",
                paragraph: {
                  rich_text: [{ text: { content: note.content } }],
                },
              },
            ],
          }),
        });

        const result = await response.json();
        results.push(result);
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notion OAuth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
