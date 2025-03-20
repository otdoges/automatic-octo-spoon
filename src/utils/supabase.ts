import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

// Types for our database schema
export type Tables = {
  tenants: {
    id: string;
    name: string;
    logo_url: string | null;
    primary_color: string | null;
    created_at: string;
  };
  users: {
    id: string;
    email: string;
    tenant_id: string | null;
    role: 'admin' | 'user' | 'tenant_admin';
    created_at: string;
  };
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    created_at: string;
  };
  orders: {
    id: string;
    user_id: string;
    tenant_id: string;
    status: 'pending' | 'paid' | 'canceled';
    total: number;
    created_at: string;
  };
  order_items: {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    created_at: string;
  };
  payments: {
    id: string;
    order_id: string;
    amount: number;
    status: 'pending' | 'succeeded' | 'failed';
    payment_method: string | null;
    created_at: string;
    stripe_payment_intent_id: string | null;
  };
  payment_methods: {
    id: string;
    user_id: string;
    type: 'card' | 'bank_account';
    last_four: string;
    expires: string | null;
    is_default: boolean;
    stripe_payment_method_id: string;
    created_at: string;
  };
  audit_logs: {
    id: string;
    user_id: string;
    tenant_id: string;
    action: string;
    resource: string;
    resource_id: string | null;
    created_at: string;
  };
}; 