import React, { createContext, useContext, useState } from 'react';
import { areas as fallbackAreas, services as fallbackServices } from '../data/catalog';

const CatalogContext = createContext({
  services: fallbackServices,
  areas: fallbackAreas,
  loading: false,
  error: null,
  refreshCatalog: () => {}
});

export function CatalogProvider({ children }) {
  const [services] = useState(fallbackServices);
  const [areas] = useState(fallbackAreas); // Areas remain static for now
  const [loading] = useState(false);
  const [error] = useState(null);

  const fetchCatalog = async () => {
    // Disabled dynamic fetching as per request
  };

  return (
    <CatalogContext.Provider value={{ services, areas, loading, error, refreshCatalog: fetchCatalog }}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
