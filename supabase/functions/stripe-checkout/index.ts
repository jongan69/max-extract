import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

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

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    // Validate Stripe secret key
    if (!stripeSecret) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return corsResponse({ error: 'Stripe configuration error' }, 500);
    }

    const { price_id, success_url, cancel_url, mode } = await req.json();

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (error) {
      console.error(`Validation error: ${error}`);
      return corsResponse({ error }, 400);
    }

    try {
      // Create a new customer for this one-time payment
      const customer = await stripe.customers.create();
      console.log(`Created temporary customer ${customer.id} for one-time payment`);

      // create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: price_id,
            quantity: 1,
          },
        ],
        mode,
        success_url,
        cancel_url,
      });

      console.log(`Created checkout session ${session.id} for customer ${customer.id}`);

      if (!session.url) {
        throw new Error('Checkout session URL not generated');
      }

      return corsResponse({ sessionId: session.id, url: session.url });
    } catch (stripeError: any) {
      console.error('Stripe API error:', stripeError);
      return corsResponse({ 
        error: stripeError.message || 'Failed to create Stripe checkout session',
        code: stripeError.code
      }, 400);
    }
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    return corsResponse({ 
      error: error.message || 'An unexpected error occurred',
      stack: error.stack
    }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}