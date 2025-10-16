import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface CheckoutSessionData {
  priceId: string;
  userId: string;
  userEmail: string;
}

export async function createCheckoutSession(data: CheckoutSessionData) {
  try {
    console.log('🔵 createCheckoutSession called with data:', data);
    
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('🟡 API response status:', response.status);
    console.log('🟡 API response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔴 API response error:', errorText);
      throw new Error('Failed to create checkout session');
    }

    const result = await response.json();
    console.log('🟡 API response data:', result);
    
    const { sessionId, url } = result;
    
    if (url) {
      console.log('🟢 Redirecting to Stripe Checkout URL:', url);
      // Redirect to Stripe Checkout
      window.location.href = url;
    } else {
      console.error('🔴 No checkout URL received in response');
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('🔴 Error in createCheckoutSession:', error);
    throw error;
  }
}

export { stripePromise };