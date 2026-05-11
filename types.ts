
export type ViewType = 'DASHBOARD' | 'FLOOR_MAP' | 'VISITOR_LOGS' | 'GATE_SCAN' | 'AFTER_HOURS' | 'SETTINGS' | 'PROFILE';

export type Role = 'STUDENT' | 'FACULTY' | 'VIP' | 'VISITOR';
export type SystemRole = 'ADMIN' | 'SECURITY' | 'OPERATOR';
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
export type StudentType = 'LOCALITE' | 'HOSTEL';

// --- AUTHENTICATION SCHEMA ---
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  avatarUrl: string;
  stationId: string;
  lastLogin: string;
}

// --- DATABASE TABLES SCHEMA ---

export interface Vehicle {
  vehicleId: string;        // PK
  plateNumber: string;
  ownerName: string;
  phoneNumber: string;
  role: Role;
  studentType?: StudentType;
  
  // Metadata / UI Helpers
  photoUrl: string;
  vehicleType: string;
  entryTime: string;       // ISO Time string
}

export interface ParkingSlot {
  slotId: string;           // PK (e.g., "1-101")
  levelId: number;          // FK to Levels
  slotNumber: number;       // e.g., 101
  status: SlotStatus;
  category: Role;           // Designated category for this slot
  
  vehicleId?: string;       // FK to Vehicle (nullable)
  
  // UI Hydration (JOIN result)
  occupant?: Vehicle;
}

export interface ParkingLog {
  logId: string;            // PK
  vehicleId: string;        // FK
  slotId: string;           // FK
  levelId: number;
  
  entryTime: string;
  exitTime?: string;        // Null if currently active
  status: 'Active' | 'Completed';
  
  // Snapshot Data (Denormalized for historical integrity)
  vehicleSnapshot: {
    plateNumber: string;
    ownerName: string;
    role: Role;
    phoneNumber: string;
  };
}

// Re-export for compatibility if needed
export type UserDetail = Vehicle;
export type VisitorLogEntry = ParkingLog;
