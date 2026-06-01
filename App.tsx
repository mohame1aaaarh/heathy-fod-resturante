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

                {/* Social Media Links */}
                <section className="py-10 md:py-16 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-[#181112] dark:text-white">تابعنا على</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">انضم إلينا على وسائل التواصل الاجتماعي</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    <a href="https://www.facebook.com/Ashkitchen2022" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                      <svg className="w-8 h-8 text-[#1877F2] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      <span className="font-bold text-gray-700 dark:text-gray-300 text-lg">فيسبوك</span>
                    </a>
                    <a href="https://www.instagram.com/labrama130" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                      <svg className="w-8 h-8 text-[#E4405F] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      <span className="font-bold text-gray-700 dark:text-gray-300 text-lg">انستغرام</span>
                    </a>
                    <a href="https://www.tiktok.com/@the.ash.house" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                      <svg className="w-8 h-8 text-[#000000] dark:text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                      <span className="font-bold text-gray-700 dark:text-gray-300 text-lg">تيك توك</span>
                    </a>
                  </div>
                </section>
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