/**
 * System Constants, Enums & Presets
 */

export const VEHICLE_TYPES = ['Hatchback', 'Sedan', 'SUV'];

export const VEHICLE_ICONS = {
  '2-Wheeler': 'https://res.cloudinary.com/xa8njngd/image/upload/v1789288623/car-wash/vehicles/two-wheeler.png',
  'Hatchback': 'https://res.cloudinary.com/xa8njngd/image/upload/v1789288624/car-wash/vehicles/hatchback.png',
  'Sedan': 'https://res.cloudinary.com/xa8njngd/image/upload/v1789289215/car-wash/vehicles/sedan.png',
  'Compact SUV': 'https://res.cloudinary.com/xa8njngd/image/upload/v1789289216/car-wash/vehicles/compact-suv.png',
  'SUV / MUV': 'https://res.cloudinary.com/xa8njngd/image/upload/v1789289217/car-wash/vehicles/suv-muv.png',
  'SUV': 'https://res.cloudinary.com/xa8njngd/image/upload/v1789289217/car-wash/vehicles/suv-muv.png',
  'Luxury': 'https://res.cloudinary.com/xa8njngd/image/upload/v1789288626/car-wash/vehicles/luxury.png'
};

export const getVehicleIcon = (type = '') => {
  if (!type) return VEHICLE_ICONS['Sedan'];
  const t = String(type).trim();
  if (VEHICLE_ICONS[t]) return VEHICLE_ICONS[t];
  const lower = t.toLowerCase();
  if (lower.includes('bike') || lower.includes('2-wheeler') || lower.includes('scooter') || lower.includes('motorcycle')) return VEHICLE_ICONS['2-Wheeler'];
  if (lower.includes('hatch')) return VEHICLE_ICONS['Hatchback'];
  if (lower.includes('compact') || lower.includes('creta') || lower.includes('brezza') || lower.includes('nexon')) return VEHICLE_ICONS['Compact SUV'];
  if (lower.includes('suv') || lower.includes('muv') || lower.includes('fortuner') || lower.includes('innova') || lower.includes('scorpio')) return VEHICLE_ICONS['SUV / MUV'];
  if (lower.includes('lux') || lower.includes('bmw') || lower.includes('audi') || lower.includes('mercedes') || lower.includes('jaguar')) return VEHICLE_ICONS['Luxury'];
  return VEHICLE_ICONS['Sedan'];
};

export const BOOKING_STATUSES = [
  { id: 'confirmed', label: '1. Confirmed', color: 'var(--accent-cyan)' },
  { id: 'vehicle_received', label: '2. Received', color: '#00D2B4' },
  { id: 'in_progress', label: '3. In Progress', color: 'var(--accent-gold)' },
  { id: 'completed', label: '4. Complete', color: '#25D366' },
  { id: 'cancelled', label: 'Cancelled', color: '#FF5964' }
];

export const SERVICE_CATEGORIES = ['Wash', 'Interior', 'Detailing', 'Ceramic', 'Exterior'];

export const EXPENSE_CATEGORIES = [
  { id: 'Supplies', label: 'Chemicals & Shampoos' },
  { id: 'Electricity', label: 'Electricity & Utilities' },
  { id: 'Salary', label: 'Staff Payroll' },
  { id: 'Maintenance', label: 'Equipment Maintenance' },
  { id: 'Rent', label: 'Rent & Bay Lease' },
  { id: 'Water', label: 'Water Supply' },
  { id: 'Marketing', label: 'Marketing & Ads' },
  { id: 'Misc', label: 'Misc Overheads' }
];

export const BAYS = ['BAY 1', 'BAY 2'];

export const VEHICLE_MULTIPLIERS = {
  '2-Wheeler': 0.5,
  'Bike': 0.5,
  'Hatchback': 0.85,
  'Sedan': 1.0,
  'Compact SUV': 1.15,
  'SUV': 1.35,
  'SUV / MUV': 1.35,
  'Luxury': 1.5
};

export const getVehicleMultiplier = (type = '') => {
  if (!type) return 1.0;
  const t = String(type).trim();
  if (VEHICLE_MULTIPLIERS[t] !== undefined) return VEHICLE_MULTIPLIERS[t];
  const lower = t.toLowerCase();
  if (lower.includes('bike') || lower.includes('2-wheeler')) return 0.5;
  if (lower.includes('hatch')) return 0.85;
  if (lower.includes('compact') || lower.includes('creta') || lower.includes('brezza')) return 1.15;
  if (lower.includes('suv') || lower.includes('muv') || lower.includes('fortuner')) return 1.35;
  if (lower.includes('lux') || lower.includes('bmw') || lower.includes('audi') || lower.includes('mercedes') || lower.includes('jaguar')) return 1.5;
  return 1.0;
};

export const SERVICE_CATALOG_PRICES = {
  'exterior car wash': 299,
  'full car wash': 649,
  'interior cleaning': 349,
  'interior vacuum cleaning': 249,
  'interior vacuum': 249,
  'car interior detailing': 1499,
  'wheel & tyre cleaning': 249,
  'wheel and tyre cleaning': 249,
  'car waxing': 899,
  'waxing': 899,
  'car polishing': 1899,
  'polishing': 1899,
  'engine bay cleaning': 549,
  'engine cleaning': 549,
  'car spa & premium detailing': 3499,
  'car spa': 3499,
  'basic refresh': 499,
  'premium shine': 799,
  'ultimate detail': 1499,
  'foam wash': 299,
  'express foam wash': 299,
  'interior steam spa': 899,
  'leather seat conditioning': 599,
  'paint correction & rubbing': 1499,
  'ceramic booster & polish': 1299,
  '9h ceramic coating': 4999,
  'underbody anti-rust coating': 999
};

export const getBasePriceForService = (name = '') => {
  if (!name) return 499;
  const lower = String(name).toLowerCase().trim();
  if (SERVICE_CATALOG_PRICES[lower]) return SERVICE_CATALOG_PRICES[lower];

  for (const [key, price] of Object.entries(SERVICE_CATALOG_PRICES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return price;
    }
  }

  return 499;
};
