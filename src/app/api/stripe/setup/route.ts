import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function GET(request: NextRequest) {
  try {
    console.log('🔵 Stripe setup check called');
    
    // Check if prices exist
    const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
    
    let starterPriceExists = false;
    let proPriceExists = false;
    
    try {
      if (starterPriceId) {
        const starterPrice = await stripe.prices.retrieve(starterPriceId);
        starterPriceExists = starterPrice.active;
        console.log('🟢 Starter price check:', { exists: starterPriceExists, price: starterPrice.id });
      }
    } catch (error) {
      console.log('🟠 Starter price not found:', error);
    }
    
    try {
      if (proPriceId) {
        const proPrice = await stripe.prices.retrieve(proPriceId);
        proPriceExists = proPrice.active;
        console.log('🟢 Pro price check:', { exists: proPriceExists, price: proPrice.id });
      }
    } catch (error) {
      console.log('🟠 Pro price not found:', error);
    }
    
    // Create test prices if they don't exist
    let createdStarterPrice = null;
    let createdProPrice = null;
    
    if (!starterPriceExists) {
      console.log('🟡 Creating starter price...');
      try {
        const product = await stripe.products.create({
          name: 'HR Software - Starter Plan',
          description: 'Piano base per piccole aziende',
        });
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 2900, // €29.00
          currency: 'eur',
          recurring: { interval: 'month' },
        });
        
        createdStarterPrice = price.id;
        console.log('🟢 Created starter price:', price.id);
      } catch (error) {
        console.error('🔴 Error creating starter price:', error);
      }
    }
    
    if (!proPriceExists) {
      console.log('🟡 Creating pro price...');
      try {
        const product = await stripe.products.create({
          name: 'HR Software - Pro Plan',
          description: 'Piano professionale per aziende in crescita',
        });
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 9900, // €99.00
          currency: 'eur',
          recurring: { interval: 'month' },
        });
        
        createdProPrice = price.id;
        console.log('🟢 Created pro price:', price.id);
      } catch (error) {
        console.error('🔴 Error creating pro price:', error);
      }
    }
    
    return NextResponse.json({
      starterPriceExists,
      proPriceExists,
      createdStarterPrice,
      createdProPrice,
      message: 'Stripe setup check completed',
    });
    
  } catch (error) {
    console.error('🔴 Error in Stripe setup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}