'use client';

import { useState } from 'react';
import { Activity, Trip } from '@/types';

interface TripFormProps {
  onSubmit: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
}

export default function TripForm({ onSubmit }: TripFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    duration: 7,
    tempMin: 15,
    tempMax: 25,
    activities: [] as Activity[],
    destination: '',
  });

  const activities: { value: Activity; label: string }[] = [
    { value: 'camping', label: 'Camping' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'hiking', label: 'Hiking' },
  ];

  const handleActivityChange = (activity: Activity, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      activities: checked
        ? [...prev.activities, activity]
        : prev.activities.filter(a => a !== activity)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Plan Your Trip</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Trip Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Mountain Adventure"
            required
          />
        </div>

        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            Destination (Optional)
          </label>
          <input
            type="text"
            id="destination"
            value={formData.destination}
            onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Yosemite National Park"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (days)
          </label>
          <input
            type="number"
            id="duration"
            min="1"
            max="30"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tempMin" className="block text-sm font-medium text-gray-700 mb-2">
              Min Temperature (°C)
            </label>
            <input
              type="number"
              id="tempMin"
              value={formData.tempMin}
              onChange={(e) => setFormData(prev => ({ ...prev, tempMin: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="tempMax" className="block text-sm font-medium text-gray-700 mb-2">
              Max Temperature (°C)
            </label>
            <input
              type="number"
              id="tempMax"
              value={formData.tempMax}
              onChange={(e) => setFormData(prev => ({ ...prev, tempMax: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Activities
          </label>
          <div className="space-y-2">
            {activities.map(({ value, label }) => (
              <label key={value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.activities.includes(value)}
                  onChange={(e) => handleActivityChange(value, e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Packing List
        </button>
      </form>
    </div>
  );
}