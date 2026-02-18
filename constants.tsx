
import { ParkingSlot, Vehicle, ParkingLog, Role, AuthUser } from './types';

export const STORAGE_KEYS = {
  SLOTS: 'unipark_db_slots',
  LOGS: 'unipark_db_logs',
  VEHICLES: 'unipark_db_vehicles',
  SESSION: 'unipark_session_user'
};

export const LEVELS = [
  { id: 1, name: 'Level 01 - Faculty & VIP', capacity: 500, category: 'MIXED' },
  { id: 2, name: 'Level 02 - Student North', capacity: 500, category: 'STUDENT' },
  { id: 3, name: 'Level 03 - Student South', capacity: 500, category: 'STUDENT' },
  { id: 4, name: 'Level 04 - Student West', capacity: 500, category: 'STUDENT' },
  { id: 5, name: 'Level 05 - Visitor Parking', capacity: 500, category: 'VISITOR' },
];

// Initial Empty Database State
export const INITIAL_LOGS: ParkingLog[] = [];

// MOCK DATABASE: USERS TABLE
// In a real app, this would be in a secure backend DB with hashed passwords
export const MOCK_USERS_DB: Record<string, AuthUser & { passwordHash: string }> = {
  'admin@unipark.com': {
    id: 'USR-ADM-001',
    name: 'Jonathan Doe',
    email: 'admin@unipark.com',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    stationId: 'Central Command',
    lastLogin: new Date().toISOString(),
    passwordHash: 'password123' // Simple simulation
  },
  'guard@unipark.com': {
    id: 'USR-SEC-042',
    name: 'Sarah Connor',
    email: 'guard@unipark.com',
    role: 'SECURITY',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    stationId: 'Gate North-1',
    lastLogin: new Date().toISOString(),
    passwordHash: 'securepass'
  }
};

// Mock Visitor for Gate Scanner (Template)
export const MOCK_GATE_VISITOR: Vehicle = {
  vehicleId: 'TEMP-GATE-001',
  plateNumber: 'MH-12-DE-5678',
  ownerName: 'Arjun Sharma',
  phoneNumber: '+91 98765 43210',
  role: 'STUDENT',
  studentType: 'LOCALITE',
  photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXTdpdYeO0Ct4JmEShMVil9xx4UpVSpzsbDabLe-gF-5gnDEqexAvWs8gt658oiPXUfWLZmLx9QhH7-m-23ovuVdENRTT9uwRxxdqPnXuasKHVTimgGeB8aKRXVf0bpxayvzvjK6C7Ns03GMwqLsr4EaTm_0u2E2zWfqTFqKCI1ihJO-XLgj6jajbAequK9iEGrx-LlFEzjcfOx3iKGLr5MrG_EgnVNlS8Q2ZVEW75XBmhNa2fE1QawcPkmVbyyQBTazoCE9pOh2ZP',
  vehicleType: '4-Wheeler (Sedan)',
  entryTime: new Date().toLocaleTimeString('en-US', { hour12: false })
};

// Database Initialization Logic
export const initializeParkingDatabase = (): ParkingSlot[] => {
  const allSlots: ParkingSlot[] = [];

  LEVELS.forEach(level => {
    // Generate 500 slots per level (101 to 600)
    for (let i = 0; i < 500; i++) {
      const slotNum = 101 + i;
      
      // Determine designated category
      let category: Role = 'STUDENT';
      if (level.id === 1) {
        category = i < 100 ? 'VIP' : 'FACULTY';
      } else {
        category = (level.category as any) === 'MIXED' ? 'FACULTY' : (level.category as Role);
      }

      allSlots.push({
        slotId: `${level.id}-${slotNum}`,
        levelId: level.id,
        slotNumber: slotNum,
        status: 'AVAILABLE', // Fresh State
        category: category,
        vehicleId: undefined,
        occupant: undefined
      });
    }
  });

  return allSlots;
};
