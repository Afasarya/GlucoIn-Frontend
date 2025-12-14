// API exports - barrel file for clean imports
// Note: Some modules have conflicting exports, import directly when needed

export * from './config';
export * from './auth';

// Admin API (includes getAllFacilities, cancelBooking for admin)
export * from './admin';

// Detection API
export * from './detection';

// Lab Results API
export * from './labResults';

// For other modules with conflicting exports, import directly:
// - import { ... } from '@/lib/api/facility'
// - import { ... } from '@/lib/api/doctor'
// - import { ... } from '@/lib/api/marketplace'
// - import { ... } from '@/lib/api/booking'
