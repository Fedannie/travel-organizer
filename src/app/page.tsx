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
  }, []);

  // Save to localStorage whenever trips or lists change
  useEffect(() => {
    localStorage.setItem('travel-organizer-trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('travel-organizer-lists', JSON.stringify(lists));
  }, [lists]);

  const handleTripSubmit = (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
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

    setTrips(prev => [...prev, newTrip]);
    setLists(prev => [...prev, newPackingList]);
    setCurrentTrip(newTrip);
    setPackingList(newPackingList);
  };

  const handleItemUpdate = (itemId: string, updates: Partial<PackingItem>) => {
    if (!packingList) return;

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

  const handleItemAdd = (newItemData: Omit<PackingItem, 'id'>) => {
    if (!packingList) return;

    const newItem: PackingItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
    };

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

  const handleItemRemove = (itemId: string) => {
    if (!packingList) return;

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