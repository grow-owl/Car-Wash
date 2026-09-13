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
  { id: 'confirmed', label: '1. Booking Confirmed', color: 'var(--accent-cyan)' },
  { id: 'vehicle_received', label: '2. Vehicle Received', color: '#00D2B4' },
  { id: 'in_progress', label: '3. Service In Progress', color: 'var(--accent-gold)' },
  { id: 'quality_check', label: '4. Quality Check', color: '#B388FF' },
  { id: 'ready_for_pickup', label: '5. Ready for Pickup', color: '#25D366' },
  { id: 'completed', label: '6. Completed', color: '#25D366' },
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
