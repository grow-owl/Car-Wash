/**
 * System Constants, Enums & Presets
 */

export const VEHICLE_TYPES = ['Hatchback', 'Sedan', 'SUV'];

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
