import React, { createContext, useContext, useState, useEffect } from 'react';
import { getServiceCategories } from '../lib/api';
import { areas as fallbackAreas, services as fallbackServices } from '../data/catalog';

const CatalogContext = createContext({
  services: fallbackServices,
  areas: fallbackAreas,
  loading: false,
  error: null,
  refreshCatalog: () => {}
});

export function CatalogProvider({ children }) {
  const [services, setServices] = useState(fallbackServices);
  const [areas] = useState(fallbackAreas); // Areas remain static for now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const dbServices = await getServiceCategories();
      
      // If DB has services, use them, otherwise stick to fallback
      if (dbServices && dbServices.length > 0) {
        // Map DB fields to match what the frontend expects
        const mappedServices = dbServices.filter(s => s.is_active !== false).map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          image: s.image_url || `/images/services/${s.slug}.jpg`,
          description: s.description || '',
          keywords: s.keywords || ''
        }));
        setServices(mappedServices);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load services from DB, using fallback.', err);
      setError(err);
      // Fallback is already set
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  return (
    <CatalogContext.Provider value={{ services, areas, loading, error, refreshCatalog: fetchCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
