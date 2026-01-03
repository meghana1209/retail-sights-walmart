import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;

export interface ProductWithCategory extends Product {
  categories?: Category | null;
}

export const useProducts = (categoryFilter?: string, searchTerm?: string) => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*, categories(*)');

        if (categoryFilter && categoryFilter !== 'all') {
          query = query.eq('category_id', categoryFilter);
        }

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Set up real-time subscription
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryFilter, searchTerm]);

  return { products, loading, error };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_featured', true)
        .limit(8);

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  return { products, loading };
};
