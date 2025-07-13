'use client';

import { useState } from 'react';
import { PackingItem, Category } from '@/types';

interface PackingListProps {
  items: PackingItem[];
  onItemUpdate: (itemId: string, updates: Partial<PackingItem>) => void;
  onItemAdd: (item: Omit<PackingItem, 'id'>) => void;
  onItemRemove: (itemId: string) => void;
}

const categoryColors: Record<Category, string> = {
  camping: 'bg-green-100 text-green-800',
  cycling: 'bg-blue-100 text-blue-800',
  hiking: 'bg-orange-100 text-orange-800',
  hygiene: 'bg-pink-100 text-pink-800',
  clothes: 'bg-purple-100 text-purple-800',
  common: 'bg-gray-100 text-gray-800',
  devices: 'bg-yellow-100 text-yellow-800',
  others: 'bg-indigo-100 text-indigo-800',
};

export default function PackingList({ items, onItemUpdate, onItemAdd, onItemRemove }: PackingListProps) {
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'others' as Category,
    quantity: 1,
    priority: 'medium' as const,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleTogglePacked = (itemId: string, packed: boolean) => {
    onItemUpdate(itemId, { packed });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity > 0) {
      onItemUpdate(itemId, { quantity });
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim()) {
      onItemAdd({
        ...newItem,
        packed: false,
      });
      setNewItem({
        name: '',
        category: 'others',
        quantity: 1,
        priority: 'medium',
      });
      setShowAddForm(false);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<Category, PackingItem[]>);

  const totalItems = items.length;
  const packedItems = items.filter(item => item.packed).length;
  const progressPercentage = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Packing List</h2>
          <p className="text-sm text-gray-600">
            {packedItems} of {totalItems} items packed ({Math.round(progressPercentage)}%)
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add Item
        </button>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddItem} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Add New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Item name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value as Category }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(categoryColors).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="text-lg font-medium mb-3 flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${categoryColors[category as Category]}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              <span className="text-gray-500">({categoryItems.length} items)</span>
            </h3>
            <div className="space-y-2">
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.packed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={(e) => handleTogglePacked(item.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className={`${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.name}
                    </span>
                    {item.priority === 'high' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        High Priority
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => onItemRemove(item.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items in your packing list yet. Generate suggestions or add items manually.
        </div>
      )}
    </div>
  );
}