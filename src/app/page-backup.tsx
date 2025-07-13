'use client';

import { useState } from 'react';
import TripForm from '@/components/TripForm';
import PackingList from '@/components/PackingList';
import { Trip, PackingItem } from '@/types';
import { generatePackingList } from '@/utils/packingTemplates';
import { useTrips, usePackingList } from '@/hooks/useApi';

export default function Home() {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  
  const { trips, loading: tripsLoading, error: tripsError, createTrip } = useTrips();
  const { 
    packingList, 
    loading: listLoading, 
    error: listError, 
    createPackingList, 
    updateItem, 
    addItem, 
    removeItem,
    refreshPackingList 
  } = usePackingList(currentListId || undefined);

  const handleTripSubmit = async (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
    try {
      const newTrip = await createTrip(tripData);
      
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

      const newPackingList = await createPackingList(packingListData);
      
      setCurrentTrip(newTrip);
      setCurrentListId(newPackingList.id);
    } catch (error) {
      console.error('Failed to create trip:', error);
    }
  };

  const handleItemUpdate = async (itemId: string, updates: Partial<PackingItem>) => {
    try {
      await updateItem(itemId, updates);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleItemAdd = async (newItemData: Omit<PackingItem, 'id'>) => {
    if (!currentListId) return;
    try {
      await addItem(currentListId, newItemData);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleItemRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleNewTrip = () => {
    setCurrentTrip(null);
    setCurrentListId(null);
  };

  const handleLoadTrip = (trip: Trip) => {
    setCurrentTrip(trip);
    
    // Find the packing list for this trip
    const tripWithLists = trips.find(t => t.id === trip.id);
    if (tripWithLists && (tripWithLists as any).packingLists?.length > 0) {
      const firstList = (tripWithLists as any).packingLists[0];
      setCurrentListId(firstList.id);
      refreshPackingList(firstList.id);
    } else {
      setCurrentListId(null);
    }
  };

  const getPackingProgress = (trip: Trip) => {
    const tripWithLists = trips.find(t => t.id === trip.id);
    if (!tripWithLists || !(tripWithLists as any).packingLists?.length) {
      return { packedItems: 0, totalItems: 0, progress: 0 };
    }
    
    const list = (tripWithLists as any).packingLists[0];
    const packedItems = list.items?.filter((item: any) => item.packed).length || 0;
    const totalItems = list.items?.length || 0;
    const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;
    
    return { packedItems, totalItems, progress };
  };

  if (tripsLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Messages */}
      {(tripsError || listError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            {tripsError && <div>Trips Error: {tripsError}</div>}
            {listError && <div>List Error: {listError}</div>}
          </div>
        </div>
      )}

      {/* Trip History */}
      {trips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Trips</h2>
            <button
              onClick={handleNewTrip}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              New Trip
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => {
              const { packedItems, totalItems, progress } = getPackingProgress(trip);

              return (
                <div
                  key={trip.id}
                  onClick={() => handleLoadTrip(trip)}
                  className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                    currentTrip?.id === trip.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <h3 className="font-medium">{trip.name}</h3>
                  <p className="text-sm text-gray-600">{trip.destination}</p>
                  <p className="text-sm text-gray-600">
                    {trip.duration} days • {trip.tempMin}°C - {trip.tempMax}°C
                  </p>
                  <p className="text-sm text-gray-600">
                    Activities: {trip.activities.join(', ')}
                  </p>
                  {totalItems > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{packedItems}/{totalItems} packed</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trip Form or Packing List */}
      {!currentTrip ? (
        <TripForm onSubmit={handleTripSubmit} />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{currentTrip.name}</h2>
                {currentTrip.destination && (
                  <p className="text-gray-600">{currentTrip.destination}</p>
                )}
                <p className="text-sm text-gray-600">
                  {currentTrip.duration} days • {currentTrip.tempMin}°C - {currentTrip.tempMax}°C
                </p>
                <p className="text-sm text-gray-600">
                  Activities: {currentTrip.activities.join(', ')}
                </p>
              </div>
              <button
                onClick={handleNewTrip}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                New Trip
              </button>
            </div>
          </div>

          {listLoading ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8 text-gray-600">Loading packing list...</div>
            </div>
          ) : packingList ? (
            <PackingList
              items={packingList.items}
              onItemUpdate={handleItemUpdate}
              onItemAdd={handleItemAdd}
              onItemRemove={handleItemRemove}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center py-8 text-gray-600">No packing list found for this trip.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}