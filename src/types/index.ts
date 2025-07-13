export type Activity = 'camping' | 'cycling' | 'hiking';

export type Category = 
  | 'camping' 
  | 'cycling' 
  | 'hiking' 
  | 'hygiene' 
  | 'clothes' 
  | 'common' 
  | 'devices' 
  | 'others';

export interface Trip {
  id: string;
  name: string;
  duration: number;
  tempMin: number;
  tempMax: number;
  activities: Activity[];
  destination?: string;
  createdAt: Date;
}

export interface PackingItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  packed: boolean;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface PackingList {
  id: string;
  tripId: string;
  name: string;
  items: PackingItem[];
  createdAt: Date;
  updatedAt: Date;
}