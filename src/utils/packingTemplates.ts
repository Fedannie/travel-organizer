import { Activity, Category, PackingItem } from '@/types';

interface ItemTemplate {
  name: string;
  category: Category;
  baseQuantity: number;
  activities: Activity[];
  tempRange?: { min: number; max: number };
}

const itemTemplates: ItemTemplate[] = [
  // Common items
  { name: 'Underwear', category: 'clothes', baseQuantity: 3, activities: [] },
  { name: 'Socks', category: 'clothes', baseQuantity: 3, activities: [] },
  { name: 'Phone charger', category: 'devices', baseQuantity: 1, activities: [] },
  { name: 'Toothbrush', category: 'hygiene', baseQuantity: 1, activities: [] },
  { name: 'Toothpaste', category: 'hygiene', baseQuantity: 1, activities: [] },
  { name: 'Shampoo', category: 'hygiene', baseQuantity: 1, activities: [] },
  
  // Weather-based clothing
  { name: 'T-shirts', category: 'clothes', baseQuantity: 2, activities: [], tempRange: { min: 15, max: 40 } },
  { name: 'Shorts', category: 'clothes', baseQuantity: 2, activities: [], tempRange: { min: 20, max: 40 } },
  { name: 'Long pants', category: 'clothes', baseQuantity: 1, activities: [], tempRange: { min: -10, max: 25 } },
  { name: 'Sweater', category: 'clothes', baseQuantity: 1, activities: [], tempRange: { min: -10, max: 15 } },
  { name: 'Winter jacket', category: 'clothes', baseQuantity: 1, activities: [], tempRange: { min: -10, max: 5 } },
  { name: 'Rain jacket', category: 'clothes', baseQuantity: 1, activities: [], tempRange: { min: 0, max: 25 } },
  
  // Camping gear
  { name: 'Tent', category: 'camping', baseQuantity: 1, activities: ['camping'] },
  { name: 'Sleeping bag', category: 'camping', baseQuantity: 1, activities: ['camping'] },
  { name: 'Sleeping pad', category: 'camping', baseQuantity: 1, activities: ['camping'] },
  { name: 'Camping stove', category: 'camping', baseQuantity: 1, activities: ['camping'] },
  { name: 'Cookware set', category: 'camping', baseQuantity: 1, activities: ['camping'] },
  { name: 'Headlamp', category: 'camping', baseQuantity: 1, activities: ['camping'] },
  { name: 'Lantern', category: 'camping', baseQuantity: 1, activities: ['camping'] },
  
  // Cycling gear
  { name: 'Helmet', category: 'cycling', baseQuantity: 1, activities: ['cycling'] },
  { name: 'Cycling shorts', category: 'cycling', baseQuantity: 2, activities: ['cycling'] },
  { name: 'Cycling gloves', category: 'cycling', baseQuantity: 1, activities: ['cycling'] },
  { name: 'Bike repair kit', category: 'cycling', baseQuantity: 1, activities: ['cycling'] },
  { name: 'Bike pump', category: 'cycling', baseQuantity: 1, activities: ['cycling'] },
  
  // Hiking gear
  { name: 'Hiking boots', category: 'hiking', baseQuantity: 1, activities: ['hiking'] },
  { name: 'Backpack', category: 'hiking', baseQuantity: 1, activities: ['hiking'] },
  { name: 'Water bottle', category: 'hiking', baseQuantity: 2, activities: ['hiking'] },
  { name: 'Trail map', category: 'hiking', baseQuantity: 1, activities: ['hiking'] },
  { name: 'First aid kit', category: 'hiking', baseQuantity: 1, activities: ['hiking'] },
  { name: 'Hiking poles', category: 'hiking', baseQuantity: 2, activities: ['hiking'] },
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
  }));
}