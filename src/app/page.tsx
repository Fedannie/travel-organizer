'use client';

import { useState, useEffect } from 'react';
import TripForm from '@/components/TripForm';
import PackingList from '@/components/PackingList';
import { Trip, PackingItem, PackingList as PackingListType } from '@/types';
import { generatePackingList } from '@/utils/packingTemplates';

export default function Home() {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [packingList, setPackingList] = useState<PackingListType | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [lists, setLists] = useState<PackingListType[]>([]);
  const [apiConnected, setApiConnected] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('travel-organizer-trips');
    const savedLists = localStorage.getItem('travel-organizer-lists');
    
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    }

    // Test API connection
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      const response = await fetch('/api/trips');
      if (response.ok) {
        setApiConnected(true);
        console.log('✅ Database API connected');
        // Load data from database if API is working
        const data = await response.json();
        if (data.length > 0) {
          console.log('📦 Loading data from database');
          // Convert database format to frontend format
          const dbTrips = data.map((trip: any) => ({
            ...trip,
            createdAt: new Date(trip.createdAt)
          }));
          setTrips(dbTrips);
          
          // Convert packing lists
          const dbLists = data.flatMap((trip: any) => 
            trip.packingLists.map((list: any) => ({
              ...list,
              createdAt: new Date(list.createdAt),
              updatedAt: new Date(list.updatedAt)
            }))
          );
          setLists(dbLists);
        }
      }
    } catch (error) {
      console.log('⚠️ Database API not available, using localStorage');
      setApiConnected(false);
    }
  };

  // Save to localStorage whenever trips or lists change
  useEffect(() => {
    localStorage.setItem('travel-organizer-trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('travel-organizer-lists', JSON.stringify(lists));
  }, [lists]);

  const handleTripSubmit = async (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      createdAt: new Date(),
    };

    const generatedItems = generatePackingList(
      tripData.duration,
      tripData.tempMin,
      tripData.tempMax,
      tripData.activities
    );

    const newPackingList: PackingListType = {
      id: `list-${Date.now()}`,
      tripId: newTrip.id,
      name: `${tripData.name} - Packing List`,
      items: generatedItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database if API is connected
    if (apiConnected) {
      try {
        const tripResponse = await fetch('/api/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tripData),
        });
        
        if (tripResponse.ok) {
          const dbTrip = await tripResponse.json();
          newTrip.id = dbTrip.id;
          newTrip.createdAt = new Date(dbTrip.createdAt);
          
          const listResponse = await fetch('/api/packing-lists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tripId: newTrip.id,
              name: newPackingList.name,
              items: generatedItems,
            }),
          });
          
          if (listResponse.ok) {
            const dbList = await listResponse.json();
            newPackingList.id = dbList.id;
            newPackingList.tripId = dbList.tripId;
            newPackingList.items = dbList.items;
            newPackingList.createdAt = new Date(dbList.createdAt);
            newPackingList.updatedAt = new Date(dbList.updatedAt);
          }
        }
      } catch (error) {
        console.error('Failed to save to database, using localStorage fallback');
      }
    }

    setTrips(prev => [...prev, newTrip]);
    setLists(prev => [...prev, newPackingList]);
    setCurrentTrip(newTrip);
    setPackingList(newPackingList);
  };

  const handleItemUpdate = async (itemId: string, updates: Partial<PackingItem>) => {
    if (!packingList) return;

    // Update in database if connected
    if (apiConnected) {
      try {
        await fetch(`/api/packing-items/${itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error('Failed to update item in database');
      }
    }

    const updatedItems = packingList.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    const updatedList = {
      ...packingList,
      items: updatedItems,
      updatedAt: new Date(),
    };

    setPackingList(updatedList);
    setLists(prev => prev.map(list => 
      list.id === packingList.id ? updatedList : list
    ));
  };

  const handleItemAdd = async (newItemData: Omit<PackingItem, 'id'>) => {
    if (!packingList) return;

    const newItem: PackingItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
    };

    // Add to database if connected
    if (apiConnected) {
      try {
        const response = await fetch(`/api/packing-lists/${packingList.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItemData),
        });
        
        if (response.ok) {
          const dbItem = await response.json();
          newItem.id = dbItem.id;
        }
      } catch (error) {
        console.error('Failed to add item to database');
      }
    }

    const updatedItems = [...packingList.items, newItem];
    const updatedList = {
      ...packingList,
      items: updatedItems,
      updatedAt: new Date(),
    };

    setPackingList(updatedList);
    setLists(prev => prev.map(list => 
      list.id === packingList.id ? updatedList : list
    ));
  };

  const handleItemRemove = async (itemId: string) => {
    if (!packingList) return;

    // Remove from database if connected
    if (apiConnected) {
      try {
        await fetch(`/api/packing-items/${itemId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to remove item from database');
      }
    }

    const updatedItems = packingList.items.filter(item => item.id !== itemId);
    const updatedList = {
      ...packingList,
      items: updatedItems,
      updatedAt: new Date(),
    };

    setPackingList(updatedList);
    setLists(prev => prev.map(list => 
      list.id === packingList.id ? updatedList : list
    ));
  };

  const handleNewTrip = () => {
    setCurrentTrip(null);
    setPackingList(null);
  };

  const handleLoadTrip = (trip: Trip) => {
    const list = lists.find(l => l.tripId === trip.id);
    setCurrentTrip(trip);
    setPackingList(list || null);
  };

  return (
    <div className="space-y-8">
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-3 h-3 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            <span className="text-sm text-gray-600">
              {apiConnected ? 'Database connected' : 'Using local storage'}
            </span>
          </div>
          <button
            onClick={testApiConnection}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Test Connection
          </button>
        </div>
      </div>

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
              const list = lists.find(l => l.tripId === trip.id);
              const packedItems = list?.items.filter(item => item.packed).length || 0;
              const totalItems = list?.items.length || 0;
              const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

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

          {packingList && (
            <PackingList
              items={packingList.items}
              onItemUpdate={handleItemUpdate}
              onItemAdd={handleItemAdd}
              onItemRemove={handleItemRemove}
            />
          )}
        </div>
      )}
    </div>
  );
}