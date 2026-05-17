
import { ParkingSlot, Vehicle, ParkingLog, Role, SlotStatus, AuthUser } from './types';

export const STORAGE_KEYS = {
  SLOTS: 'unipark_db_slots',
  LOGS: 'unipark_db_logs',
  VEHICLES: 'unipark_db_vehicles',
  SESSION: 'unipark_session_user'
};

export const LEVELS = [
  { id: 1, name: 'Level 01 - Faculty & VIP', capacity: 100, category: 'MIXED' },
  { id: 2, name: 'Level 02 - Student North', capacity: 100, category: 'STUDENT' },
  { id: 3, name: 'Level 03 - Student South', capacity: 100, category: 'STUDENT' },
  { id: 4, name: 'Level 04 - Student West', capacity: 100, category: 'STUDENT' },
  { id: 5, name: 'Level 05 - Visitor Parking', capacity: 100, category: 'VISITOR' },
];

// Initial Empty Database State
export const INITIAL_LOGS: ParkingLog[] = [];

// MOCK DATABASE: USERS TABLE
export const MOCK_USERS_DB: Record<string, AuthUser & { passwordHash: string }> = {
  'admin@unipark.com': {
    id: 'USR-ADM-001',
    name: 'Jonathan Doe',
    email: 'admin@unipark.com',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    stationId: 'Central Command',
    lastLogin: new Date().toISOString(),
    passwordHash: 'password123'
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

// Level 1 slots 101–120: permanently reserved VIP spots (orange)
const VIP_RESERVED_ROLES: Record<number, string> = {
  101: 'Chancellor',
  102: 'President',
  103: 'Vice Chancellor',
  104: 'Provost',
  105: 'Pro Vice Chancellor',
  106: 'COO',
  107: 'CFO',
  108: 'CTO',
  109: 'CIO',
  110: 'Dean',
  111: 'Associate Dean',
  112: 'Assistant Dean',
  113: 'Dir. Academic Affairs',
  114: 'Registrar',
  115: 'Controller of Exam',
  116: 'Academic Coordinator',
  117: 'Program Director',
  118: 'HOD',
  119: 'Dept. Coordinator',
  120: 'Professor',
};

// Level 1 slots 121–150: permanently reserved Faculty spots (white)
const FACULTY_RESERVED_ROLES: Record<number, string> = {
  121: 'Assoc. Professor',
  122: 'Asst. Professor',
  123: 'Senior Lecturer',
  124: 'Lecturer',
  125: 'Teaching Assistant',
  126: 'Research Fellow',
  127: 'Lab Instructor',
  128: 'Visiting Faculty',
  129: 'Adjunct Professor',
  130: 'Dean of Students',
  131: 'Student Welfare',
  132: 'Student Affairs Dir.',
  133: 'Counselor',
  134: 'Career Guidance',
  135: 'Placement Officer',
  136: 'Internship Coord.',
  137: 'Club Coordinator',
  138: 'Sports Director',
  139: 'Cultural Coord.',
  140: 'Hostel Warden',
  141: 'Admin. Officer',
  142: 'Office Supt.',
  143: 'Exec. Assistant',
  144: 'Front Desk Officer',
  145: 'Receptionist',
  146: 'Documentation',
  147: 'Compliance Officer',
  148: 'PRO',
  149: 'Legal Advisor',
  150: 'Finance Director',
};

// Database Initialization Logic
export const initializeParkingDatabase = (): ParkingSlot[] => {
  const allSlots: ParkingSlot[] = [];

  LEVELS.forEach(level => {
    // Generate 100 slots per level (101 to 200)
    for (let i = 0; i < 100; i++) {
      const slotNum = 101 + i;

      // Determine designated category
      let category: Role = 'STUDENT';
      if (level.id === 1) {
        // First 20 = VIP, next 20 = FACULTY, rest open
        category = i < 20 ? 'VIP' : 'FACULTY';
      } else {
        category = (level.category as any) === 'MIXED' ? 'FACULTY' : (level.category as Role);
      }

      let status: SlotStatus = 'AVAILABLE';
      let reservedFor: string | undefined = undefined;

      if (level.id === 1 && VIP_RESERVED_ROLES[slotNum]) {
        status = 'RESERVED';
        reservedFor = VIP_RESERVED_ROLES[slotNum];
      } else if (level.id === 1 && FACULTY_RESERVED_ROLES[slotNum]) {
        status = 'RESERVED';
        reservedFor = FACULTY_RESERVED_ROLES[slotNum];
      }

      allSlots.push({
        slotId: `${level.id}-${slotNum}`,
        levelId: level.id,
        slotNumber: slotNum,
        status: status,
        category: category,
        reservedFor: reservedFor,
        vehicleId: undefined,
        occupant: undefined
      });
    }
  });

  return allSlots;
};
