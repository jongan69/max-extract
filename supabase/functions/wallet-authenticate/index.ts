import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import bs58 from "npm:bs58@6.0.0";
import nacl from "npm:tweetnacl@1.0.3";
import { create, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v2.8/mod.ts";

type SignMessage = {
  domain: string;
  publicKey: string;
  nonce: string;
  statement: string;
};

export class SigninMessage {
  domain: any;
  publicKey: any;
  nonce: any;
  statement: any;

  constructor({ domain, publicKey, nonce, statement }: SignMessage) {
    console.log("SigninMessage constructor called with:", { domain, publicKey, nonce, statement });
    this.domain = domain;
    this.publicKey = publicKey;
    this.nonce = nonce;
    this.statement = statement;
  }

  prepare() {
    const prepared = `${this.statement}${this.nonce}`;
    console.log("Prepared message:", prepared);
    return prepared;
  }

  async validate(signature: string) {
    console.log("Validating signature:", signature);
    const msg = this.prepare();
    const signatureUint8 = bs58.decode(signature);
    const msgUint8 = new TextEncoder().encode(msg);
    const pubKeyUint8 = bs58.decode(this.publicKey);
    console.log("Decoded signatureUint8:", signatureUint8);
    console.log("Encoded msgUint8:", msgUint8);
    console.log("Decoded pubKeyUint8:", pubKeyUint8);
    const result = nacl.sign.detached.verify(msgUint8, signatureUint8, pubKeyUint8);
    console.log("Signature valid?", result);
    return result;
  }
}

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

Deno.serve(async (req: Request): Promise<Response> => {
  console.log("Received request:", req.method, req.url);
  if (req.method === 'OPTIONS') {
    console.log("OPTIONS request received, returning CORS headers");
    return corsResponse({}, 204);
  }

  if (req.method !== 'POST') {
    console.log("Invalid method:", req.method);
    return corsResponse({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await req.json();
    console.log("Parsed request body:", body);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  const { message, signature } = body;
  console.log("Message:", message);
  console.log("Signature:", signature);

  // Validate message and signature
  try {
    const signinMessage = new SigninMessage(JSON.parse(message || "{}"));
    const expectedDomain = new URL(Deno.env.get("AUTH_URL")!).host;
    console.log("Expected domain:", expectedDomain);
    console.log("SigninMessage domain:", signinMessage.domain);

    if (signinMessage.domain !== expectedDomain) {
      console.log("Domain mismatch:", signinMessage.domain, expectedDomain);
      return corsResponse({ error: 'Invalid domain' }, 401);
    }

    // Implement your own CSRF/nonce check here
    // For example, compare signinMessage.nonce with a value from a cookie/header

    const isValid = await signinMessage.validate(signature || "");
    console.log("Signature valid?", isValid);
    if (!isValid) {
      console.log("Invalid signature for message:", message);
      return corsResponse({ error: 'Invalid signature' }, 401);
    }

    // Use publicKey as unique identifier in email and user_metadata
    const publicKey = signinMessage.publicKey;
    const email = `${publicKey}@maxextract.fun`;
    console.log("Using email:", email);

    // Try to find user by email using the Admin REST API
    const adminUrl = `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
    console.log("Admin user lookup URL:", adminUrl);
    const adminRes = await fetch(adminUrl, {
      headers: {
        apiKey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
    });
    console.log("Admin user lookup response status:", adminRes.status);
    const adminData = await adminRes.json();
    console.log("Admin user lookup response data:", adminData);
    let user = adminData.users && adminData.users.length > 0 ? adminData.users[0] : null;

    if (!user) {
      console.log("User not found, creating new user...");
      // Create user with email and publicKey in user_metadata
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { publicKey }
      });
      console.log("Create user result:", newUser, createError);
      if (createError || !newUser?.user) {
        console.error("User creation failed:", createError);
        return corsResponse({ error: 'User creation failed' }, 500);
      }
      user = newUser.user;
    }

    // Issue a custom JWT for the user (wallet session)
    console.log("Issuing custom JWT session for user:", publicKey);
    const jwtSecret = Deno.env.get("JWT_SECRET");
    console.log("JWT_SECRET from env:", jwtSecret);
    if (!jwtSecret) {
      console.error("JWT_SECRET not set in environment");
      return corsResponse({ error: 'Server misconfiguration' }, 500);
    }
    const keyBuf = new TextEncoder().encode(jwtSecret);
    console.log("JWT key buffer (Uint8Array):", keyBuf);
    const key = await crypto.subtle.importKey(
      "raw",
      keyBuf,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
    console.log("JWT CryptoKey:", key);
    const header: Header = { alg: "HS256", typ: "JWT" };
    console.log("JWT header:", header);
    const payload: Payload = {
      sub: publicKey,
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60), // 1 hour from now
      user_id: user.id,
      email: user.email,
    };
    console.log("JWT payload:", payload);
    let jwt;
    try {
      jwt = await create(header, payload, key);
      console.log("JWT created:", jwt);
    } catch (err) {
      console.error("JWT creation error:", err);
      return corsResponse({ error: 'Token minting failed', details: err?.message || err }, 500);
    }
    if (!jwt) {
      console.error("Failed to sign JWT");
      return corsResponse({ error: 'Token minting failed' }, 500);
    }
    console.log("Authentication successful, returning custom JWT.");
    return corsResponse(
      JSON.stringify({
        token: jwt,
        user,
      }),
      200
    );
  } catch (e) {
    console.error("Authentication failed:", e);
    return corsResponse({ error: 'Authentication failed' }, 401);
  }
});
