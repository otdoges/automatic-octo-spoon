import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  env.STRIPE_SECRET_KEY ?? ''
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create a Stripe customer if they don't have one
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
          tenantId: user.tenant_id,
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create a payment method setup session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'setup',
      success_url: `${request.headers.get('origin')}/payments?success=true`,
      cancel_url: `${request.headers.get('origin')}/payments?canceled=true`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error setting up payment method:', error);
    return NextResponse.json(
      { error: 'Failed to setup payment method' },
      { status: 500 }
    );
  }
} 