import { useState } from 'react';
import { STRIPE_PRODUCTS } from '../stripe-config';

interface UseStripeOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

export function useStripe(options: UseStripeOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCheckoutSession = async (productKey: keyof typeof STRIPE_PRODUCTS) => {
    setLoading(true);
    setError(null);

    try {
      const product = STRIPE_PRODUCTS[productKey];

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
          mode: product.mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.url || !data.sessionId) {
        throw new Error('Invalid response from checkout service');
      }

      if (options.onSuccess) {
        options.onSuccess(data.sessionId);
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error,
  };
}