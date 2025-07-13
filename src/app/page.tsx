'use client';

import { useState, useEffect } from 'react';
import TripForm from '@/components/TripForm';
import { Trip } from '@/types';
import { generatePackingList } from '@/utils/packingTemplates';

export default function Home() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrips() {
      try {
        console.log('Starting API call...');
        const response = await fetch('/api/trips');
        console.log('Response status:', response.status, response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        setTrips(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, []);

  const handleTripSubmit = async (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
    try {
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
      
      const generatedItems = generatePackingList(
        tripData.duration,
        tripData.tempMin,
        tripData.tempMax,
        tripData.activities
      );

      const packingListData = {
        tripId: newTrip.id,
        name: `${tripData.name} - Packing List`,
        items: generatedItems,
      };

      const listResponse = await fetch('/api/packing-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packingListData),
      });
      
      if (!listResponse.ok) {
        throw new Error('Failed to create packing list');
      }

      // Refresh trips
      const tripsResponse = await fetch('/api/trips');
      if (tripsResponse.ok) {
        const updatedTrips = await tripsResponse.json();
        setTrips(updatedTrips);
      }
    } catch (error) {
      console.error('Failed to create trip:', error);
      setError('Failed to create trip');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Trip History */}
      {trips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Trips ({trips.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => (
              <div key={trip.id} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium">{trip.name}</h3>
                <p className="text-sm text-gray-600">{trip.destination}</p>
                <p className="text-sm text-gray-600">
                  {trip.duration} days • {trip.tempMin}°C - {trip.tempMax}°C
                </p>
                <p className="text-sm text-gray-600">
                  Activities: {trip.activities.join(', ') || 'None'}
                </p>
                {trip.packingLists?.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {trip.packingLists[0].items?.length || 0} items in packing list
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trip Form */}
      <TripForm onSubmit={handleTripSubmit} />
    </div>
  );
}