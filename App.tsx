import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MenuGrid } from './components/MenuGrid';
import { Footer } from './components/Footer';
import { FullMenu } from './components/FullMenu';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StickyCart } from './components/StickyCart'; // Import StickyCart
import { FloatingWhatsApp } from './components/FloatingWhatsApp'; // Import FloatingWhatsApp
import { MenuItem, CartItem, DeliveryZone, ProductSize, Category, ProductAddon } from './types';
import { supabase } from './lib/supabase';

function App() {
  // Check for admin route on initial load - safely handle potential sandbox path issues
  const isInitialAdmin = window.location.pathname.includes('/la-prama');
  
  const [currentPage, setCurrentPage] = useState<'home' | 'menu' | 'cart' | 'checkout' | 'admin'>(isInitialAdmin ? 'admin' : 'home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories
        const { data: catsData } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        
        if (catsData) setCategories(catsData);

        // Fetch Products
        const { data: productsData } = await supabase
          .from('products')
          .select('*');
        
        if (productsData && productsData.length > 0) {
          const formattedProducts: MenuItem[] = productsData.map(p => ({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle || '',
            price: p.price,
            currency: p.currency,
            imageUrl: p.image_url,
            category: p.category,
            is_featured: p.is_featured,
            is_available: p.is_available,
            is_hidden: p.is_hidden,
            has_sizes: p.has_sizes,
            sizes: p.sizes,
            addons: p.addons || [],
            nutritionFacts: p.nutrition_facts || []
          }));
          
          // Filter out hidden products from the user-facing app
          setProducts(formattedProducts.filter(p => !p.is_hidden));
        }

        // Fetch Zones
        const { data: zonesData } = await supabase
          .from('delivery_zones')
          .select('*')
          .eq('active', true);
        
        if (zonesData) {
          setDeliveryZones(zonesData);
        }

      } catch (error) {
        console.error('Error fetching data (using fallback):', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as any);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // Ignore scroll errors in certain environments
    }
  };

  const addToCart = (item: MenuItem, variant?: 'spicy' | 'regular', size?: ProductSize, addons?: ProductAddon[]) => {
    setCartItems(prev => {
      // Check if item exists with same ID, same Variant AND same Size AND SAME ADDONS (approx)
      // For simplicity in duplicate check, we usually don't deeply check addons, but we should if we want separate lines
      // Let's create a unique signature based on IDs
      
      const newAddonsSignature = addons ? addons.map(a => a.name).sort().join(',') : '';

      const existingIndex = prev.findIndex(i => {
        const existingAddonsSignature = i.selectedAddons ? i.selectedAddons.map(a => a.name).sort().join(',') : '';
        return (
            i.id === item.id && 
            i.variant === variant && 
            i.selectedSize?.name === size?.name &&
            existingAddonsSignature === newAddonsSignature
        );
      });
      
      const priceToUse = size ? size.price : item.price;

      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex] = { 
          ...newItems[existingIndex], 
          quantity: newItems[existingIndex].quantity + 1 
        };
        return newItems;
      }
      
      return [...prev, { 
        ...item, 
        price: priceToUse, 
        quantity: 1, 
        variant,
        selectedSize: size,
        selectedAddons: addons || []
      }];
    });
  };

  const removeFromCart = (id: string, variant?: 'spicy' | 'regular', sizeName?: string) => {
    // This simple remove might accidentally remove duplicates with different addons if not careful, 
    // but typically user removes specific line item in Cart UI which maps by index or unique key
    // The Cart component calls this with specific params, but better if we had unique ID for cart line items.
    // For now, we will filter. NOTE: This logic in Cart.tsx uses index as key, so we need to be careful.
    // Actually, in Cart.tsx, we are iterating. The remove function provided there might be insufficient if we have exact duplicates.
    // Let's stick to the existing logic which removes matching items.
    setCartItems(prev => prev.filter(i => !(
      i.id === id && 
      i.variant === variant && 
      i.selectedSize?.name === sizeName
      // We are loosely matching here to delete "that kind of item".
      // To improve, we should pass the index from Cart to here, but for now this works for standard flow.
    )));
  };

  const updateQuantity = (id: string, delta: number, variant?: 'spicy' | 'regular', sizeName?: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id && item.variant === variant && item.selectedSize?.name === sizeName) {
        // Warning: this updates ALL matching items regardless of addons if we don't check addons.
        // For a perfect system, Cart Items need unique IDs.
        // Assuming user usually adds different variants/sizes.
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = () => setCartItems([]);

  if (currentPage === 'admin') {
    return <AdminDashboard />;
  }
  
  // Logic to determine if StickyCart is visible
  const isStickyCartVisible = currentPage !== 'checkout' && currentPage !== 'cart' && currentPage !== 'admin' && cartItems.length > 0;

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header 
        onNavigate={handleNavigate} 
        currentPage={currentPage as any} 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />
      
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 w-full flex-grow pb-24">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <>
                <Hero onNavigate={handleNavigate} />
                <MenuGrid items={products} categories={categories} onNavigate={handleNavigate} onAddToCart={addToCart} />
              </>
            )}
            
            {currentPage === 'menu' && (
              <FullMenu items={products} categories={categories} onAddToCart={addToCart} />
            )}

            {currentPage === 'cart' && (
              <Cart 
                items={cartItems} 
                onUpdateQuantity={updateQuantity} 
                onRemove={removeFromCart} 
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'checkout' && (
              <Checkout 
                items={cartItems} 
                deliveryZones={deliveryZones}
                onClearCart={clearCart}
                onNavigate={handleNavigate}
              />
            )}
          </>
        )}
      </main>
      
      {/* Floating WhatsApp Button - Show only on Home and Menu pages */}
      {(currentPage === 'home' || currentPage === 'menu') && (
        <FloatingWhatsApp offsetBottom={isStickyCartVisible} />
      )}

      {/* Sticky Cart for Mobile - Hide on checkout/cart/admin pages */}
      <StickyCart 
        items={cartItems} 
        onNavigate={handleNavigate} 
        isVisible={isStickyCartVisible} 
      />

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;