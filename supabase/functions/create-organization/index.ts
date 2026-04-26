import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  name: string;
  slug: string;
  adminEmail: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, slug, adminEmail } = (await req.json()) as RequestBody;

    console.log("Received data:", { name, slug, adminEmail });

    // Validate inputs
    if (!name || !slug || !adminEmail) {
      console.log("Validation failed:", { name: !!name, slug: !!slug, adminEmail: !!adminEmail });
      return new Response(
        JSON.stringify({ error: `Missing required fields: name=${!!name}, slug=${!!slug}, adminEmail=${!!adminEmail}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with Service Role Key (available in Edge Function environment)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Create Organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert([{ name, slug, description: null, is_active: true }])
      .select()
      .single();

    if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);

    // 2. Invite User with Admin Role
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      adminEmail,
      {
        data: {
          org_id: org.id,
          role: "ORG_ADMIN",
        },
      }
    );

    if (inviteError) {
      console.warn("User invitation failed (non-blocking):", inviteError.message);
      // Continue even if invitation fails - org was created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        organization: org,
        invitationSent: !inviteError,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
