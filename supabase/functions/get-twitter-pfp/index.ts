// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
console.info("server started");
// Helper function to create responses with CORS headers
function corsResponse(body, status = 200) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    // @ts-ignore
    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
  };
  if (status === 204) {
    return new Response(null, {
      status,
      headers
    });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json"
    }
  });
}
// @ts-ignore
Deno.serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return corsResponse(null, 204);
  }
  try {
    const { twitterHandle } = await req.json();
    console.log("Requested Twitter handle:", twitterHandle);
    const profileRes = await fetch(`https://twitterapi-2cw6.onrender.com/api/twitter/userProfile?handle=${twitterHandle}`, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!profileRes.ok) {
      throw new Error(`Upstream Twitter API failed with status ${profileRes.status}`);
    }
    const profileData = await profileRes.json();
    return corsResponse(profileData, 200);
  } catch (error) {
    console.error("Error fetching Twitter profile:", error);
    return corsResponse({
      error: "Failed to fetch Twitter profile"
    }, 500);
  }
});
