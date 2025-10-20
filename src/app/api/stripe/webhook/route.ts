import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stackServerApp } from '@/lib/stack';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle successful payment
        if (session.payment_status === 'paid') {
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan;
          
          console.log(`Payment successful for user ${userId} with plan ${plan}`);
          
          try {
            // Update user subscription status in Stack Auth
            if (userId) {
              const user = await stackServerApp.getUser(userId);
              if (user) {
                // Update user metadata to mark as paid subscriber
                await user.update({
                  clientReadOnlyMetadata: {
                    ...user.clientReadOnlyMetadata,
                    subscriptionStatus: 'active',
                    subscriptionPlan: plan,
                    stripeCustomerId: session.customer,
                    stripeSubscriptionId: session.subscription,
                    subscriptionStartDate: new Date().toISOString(),
                  },
                });
                
                console.log(`User ${userId} subscription status updated to active`);
              }
            }
          } catch (error) {
            console.error('Error updating user subscription status:', error);
          }
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.customer) {
          console.log(`Payment succeeded for customer ${invoice.customer}`);
          
          try {
            // Find user by Stripe customer ID and update last payment date
            // Note: This would require a way to find user by customer ID
            // For now, we'll log the event
            console.log(`Invoice payment succeeded for customer ${invoice.customer}`);
          } catch (error) {
            console.error('Error handling invoice payment succeeded:', error);
          }
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        
        if (failedInvoice.customer) {
          console.log(`Payment failed for customer ${failedInvoice.customer}`);
          
          try {
            // Find user by Stripe customer ID and update failed payment date
            // Note: This would require a way to find user by customer ID
            // For now, we'll log the event
            console.log(`Invoice payment failed for customer ${failedInvoice.customer}`);
          } catch (error) {
            console.error('Error handling invoice payment failed:', error);
          }
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        if (deletedSubscription.customer) {
          console.log(`Subscription deleted for customer ${deletedSubscription.customer}`);
          
          try {
            // Find user by Stripe customer ID and update subscription status
            // Note: This would require a way to find user by customer ID
            // For now, we'll log the event
            console.log(`Subscription cancelled for customer ${deletedSubscription.customer}`);
          } catch (error) {
            console.error('Error handling subscription deletion:', error);
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}