import { SigninMessage } from "../../../src/utils/signinmessage.ts"; // Adjust path as needed

export const handler = async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { message, signature } = body;

  // Validate message and signature
  try {
    const signinMessage = new SigninMessage(JSON.parse(message || "{}"));
    const expectedDomain = new URL(Deno.env.get("AUTH_URL")!).host;

    if (signinMessage.domain !== expectedDomain) {
      return new Response("Invalid domain", { status: 401 });
    }

    // Implement your own CSRF/nonce check here
    // For example, compare signinMessage.nonce with a value from a cookie/header

    const isValid = await signinMessage.validate(signature || "");
    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    // Issue a JWT or session here (using your preferred library)
    // For demonstration, just return the publicKey
    return new Response(
      JSON.stringify({ id: signinMessage.publicKey }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response("Authentication failed", { status: 401 });
  }
};

export default handler;
