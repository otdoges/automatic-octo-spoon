'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@shadcn/ui/button';
import { AppLayout } from '@/components/layout/app-layout';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/context/auth-context';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tables = {
  products: {
    id: string;
    tenant_id: string;
    name: string;
    price: number;
    description?: string;
  };
};


type Product = Tables['products'];

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('tenant_id', user.tenant_id);

        if (error) throw error;
        setProducts(data ?? []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce(
      (total, [productId, quantity]) => {
        const product = products.find((p) => p.id === productId);
        return total + (product?.price ?? 0) * quantity;
      },
      0
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">
              Total: ${getCartTotal().toFixed(2)}
            </div>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Checkout
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              {product.image_url && (
                <div className="relative h-48 w-full">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="object-cover w-full h-full rounded-t-lg"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>${product.price.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter>
                <div className="flex items-center space-x-4 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(product.id)}
                  >
                    -
                  </Button>
                  <span className="flex-1 text-center">
                    {cart[product.id] || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToCart(product.id)}
                  >
                    +
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
} 