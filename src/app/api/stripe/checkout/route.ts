import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Stripe checkout API called');
    
    const body = await request.json();
    console.log('🟡 Request body:', body);
    
    const { priceId, userId, userEmail } = body;

    if (!priceId || !userId || !userEmail) {
      console.error('🔴 Missing required parameters:', { priceId, userId, userEmail });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('🟡 Creating Stripe checkout session...');
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        plan: 'starter',
      },
      subscription_data: {
        metadata: {
          userId: userId,
          plan: 'starter',
        },
      },
    });

    console.log('🟢 Stripe session created successfully:', { sessionId: session.id, url: session.url });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('🔴 Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}