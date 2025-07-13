import { useState, useEffect } from 'react';
import { Trip, PackingList, PackingItem, Activity } from '@/types';

interface UseTripsResult {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  createTrip: (tripData: Omit<Trip, 'id' | 'createdAt'>) => Promise<Trip>;
  deleteTrip: (id: string) => Promise<void>;
  refreshTrips: () => Promise<void>;
}

export function useTrips(): UseTripsResult {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/trips');
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> => {
    try {
      setError(null);
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create trip');
      }
      
      const newTrip = await response.json();
      setTrips(prev => [newTrip, ...prev]);
      return newTrip;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create trip';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTrip = async (id: string): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(`/api/trips/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }
      
      setTrips(prev => prev.filter(trip => trip.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trip';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    loading,
    error,
    createTrip,
    deleteTrip,
    refreshTrips: fetchTrips,
  };
}

interface UsePackingListResult {
  packingList: PackingList | null;
  loading: boolean;
  error: string | null;
  createPackingList: (data: { tripId: string; name: string; items: Omit<PackingItem, 'id'>[] }) => Promise<PackingList>;
  updateItem: (itemId: string, updates: Partial<PackingItem>) => Promise<void>;
  addItem: (listId: string, item: Omit<PackingItem, 'id'>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshPackingList: (id: string) => Promise<void>;
}

export function usePackingList(initialListId?: string): UsePackingListResult {
  const [packingList, setPackingList] = useState<PackingList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackingList = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/packing-lists/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch packing list');
      }
      const data = await response.json();
      setPackingList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPackingList = async (data: { tripId: string; name: string; items: Omit<PackingItem, 'id'>[] }): Promise<PackingList> => {
    try {
      setError(null);
      const response = await fetch('/api/packing-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create packing list');
      }
      
      const newList = await response.json();
      setPackingList(newList);
      return newList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create packing list';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateItem = async (itemId: string, updates: Partial<PackingItem>): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(`/api/packing-items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      const updatedItem = await response.json();
      setPackingList(prev => prev ? {
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, ...updatedItem } : item
        ),
        updatedAt: new Date()
      } : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const addItem = async (listId: string, item: Omit<PackingItem, 'id'>): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(`/api/packing-lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      
      const newItem = await response.json();
      setPackingList(prev => prev ? {
        ...prev,
        items: [...prev.items, newItem],
        updatedAt: new Date()
      } : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const removeItem = async (itemId: string): Promise<void> => {
    try {
      setError(null);
      const response = await fetch(`/api/packing-items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item');
      }
      
      setPackingList(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        updatedAt: new Date()
      } : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    if (initialListId) {
      fetchPackingList(initialListId);
    }
  }, [initialListId]);

  return {
    packingList,
    loading,
    error,
    createPackingList,
    updateItem,
    addItem,
    removeItem,
    refreshPackingList: fetchPackingList,
  };
}