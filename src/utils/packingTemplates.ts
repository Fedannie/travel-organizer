import { Activity, Category, PackingItem } from '@/types';

interface ItemTemplate {
  name: string;
  category: Category;
  baseQuantity: number;
  activities: Activity[];
  tempRange?: { min: number; max: number };
  priority: 'high' | 'medium' | 'low';
}

const itemTemplates: ItemTemplate[] = [
  // Common items
  { name: 'Underwear', category: 'clothes', baseQuantity: 3, activities: [], priority: 'high' },
  { name: 'Socks', category: 'clothes', baseQuantity: 3, activities: [], priority: 'high' },
  { name: 'Phone charger', category: 'devices', baseQuantity: 1, activities: [], priority: 'high' },
  { name: 'Toothbrush', category: 'hygiene', baseQuantity: 1, activities: [], priority: 'high' },
  { name: 'Toothpaste', category: 'hygiene', baseQuantity: 1, activities: [], priority: 'high' },
  { name: 'Shampoo', category: 'hygiene', baseQuantity: 1, activities: [], priority: 'medium' },
  
  // Weather-based clothing
  { name: 'T-shirts', category: 'clothes', baseQuantity: 2, activities: [], tempRange: { min: 15, max: 40 }, priority: 'high' },
  { name: 'Shorts', category: 'clothes', baseQuantity: 2, activities: [], tempRange: { min: 20, max: 40 }, priority: 'high' },
  { name: 'Long pants', category: 'clothes', baseQuantity: 1, activities: [], tempRange: { min: -10, max: 25 }, priority: 'high' },
  { name: 'Sweater', category: 'clothes', baseQuantity: 1, activities: [], tempRange: { min: -10, max: 15 }, priority: 'high' },
  { name: 'Winter jacket', category: 'clothes', baseQuantity: 1, activities: [], tempRange: { min: -10, max: 5 }, priority: 'high' },
  { name: 'Rain jacket', category: 'clothes', baseQuantity: 1, activities: [], tempRange: { min: 0, max: 25 }, priority: 'medium' },
  
  // Camping gear
  { name: 'Tent', category: 'camping', baseQuantity: 1, activities: ['camping'], priority: 'high' },
  { name: 'Sleeping bag', category: 'camping', baseQuantity: 1, activities: ['camping'], priority: 'high' },
  { name: 'Sleeping pad', category: 'camping', baseQuantity: 1, activities: ['camping'], priority: 'high' },
  { name: 'Camping stove', category: 'camping', baseQuantity: 1, activities: ['camping'], priority: 'high' },
  { name: 'Cookware set', category: 'camping', baseQuantity: 1, activities: ['camping'], priority: 'medium' },
  { name: 'Headlamp', category: 'camping', baseQuantity: 1, activities: ['camping'], priority: 'high' },
  { name: 'Lantern', category: 'camping', baseQuantity: 1, activities: ['camping'], priority: 'medium' },
  
  // Cycling gear
  { name: 'Helmet', category: 'cycling', baseQuantity: 1, activities: ['cycling'], priority: 'high' },
  { name: 'Cycling shorts', category: 'cycling', baseQuantity: 2, activities: ['cycling'], priority: 'high' },
  { name: 'Cycling gloves', category: 'cycling', baseQuantity: 1, activities: ['cycling'], priority: 'medium' },
  { name: 'Bike repair kit', category: 'cycling', baseQuantity: 1, activities: ['cycling'], priority: 'high' },
  { name: 'Bike pump', category: 'cycling', baseQuantity: 1, activities: ['cycling'], priority: 'medium' },
  
  // Hiking gear
  { name: 'Hiking boots', category: 'hiking', baseQuantity: 1, activities: ['hiking'], priority: 'high' },
  { name: 'Backpack', category: 'hiking', baseQuantity: 1, activities: ['hiking'], priority: 'high' },
  { name: 'Water bottle', category: 'hiking', baseQuantity: 2, activities: ['hiking'], priority: 'high' },
  { name: 'Trail map', category: 'hiking', baseQuantity: 1, activities: ['hiking'], priority: 'medium' },
  { name: 'First aid kit', category: 'hiking', baseQuantity: 1, activities: ['hiking'], priority: 'high' },
  { name: 'Hiking poles', category: 'hiking', baseQuantity: 2, activities: ['hiking'], priority: 'medium' },
];

export function generatePackingList(
  duration: number,
  tempMin: number,
  tempMax: number,
  activities: Activity[]
): PackingItem[] {
  const relevantTemplates = itemTemplates.filter(template => {
    // Include common items (no specific activities)
    if (template.activities.length === 0) {
      // Check temperature range if specified
      if (template.tempRange) {
        return tempMax >= template.tempRange.min && tempMin <= template.tempRange.max;
      }
      return true;
    }
    
    // Include activity-specific items
    return template.activities.some(activity => activities.includes(activity));
  });

  return relevantTemplates.map((template, index) => ({
    id: `item-${index}`,
    name: template.name,
    category: template.category,
    quantity: Math.max(1, Math.ceil(template.baseQuantity * (duration / 7))), // Scale by week
    packed: false,
    priority: template.priority,
  }));
}