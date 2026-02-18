
import { AuthUser, ParkingSlot, ParkingLog, Vehicle, Role } from './types';
import { MOCK_USERS_DB, STORAGE_KEYS, initializeParkingDatabase } from './constants';

// Helper to simulate delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiClient {
  constructor() {}

  // --- HEALTH CHECK ---
  async checkHealth(): Promise<boolean> {
      // Always true for standalone local mode
      return Promise.resolve(true);
  }

  // --- AUTHENTICATION ---

  async login(email: string, password: string): Promise<{ token: string, user: AuthUser }> {
    await delay(800); // Simulate network
    const user = MOCK_USERS_DB[email];
    if (user && user.passwordHash === password) {
      const { passwordHash, ...safeUser } = user;
      return { token: 'local-session-token', user: safeUser as AuthUser };
    }
    throw new Error('Invalid credentials');
  }

  async signup(data: any): Promise<{ token: string, user: AuthUser }> {
      await delay(800);
      // In a real local app, we would persist users to localStorage. 
      // For this demo, we mock the success response.
      const newUser: AuthUser = {
          id: `USR-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role,
          stationId: data.stationId,
          avatarUrl: '',
          lastLogin: new Date().toISOString()
      };
      
      // Temporarily add to memory for this session
      MOCK_USERS_DB[data.email] = { ...newUser, passwordHash: data.password };
      
      return { token: 'local-session-token', user: newUser };
  }

  // --- DATA FETCHING ---

  async getDashboardState(): Promise<{ slots: ParkingSlot[], logs: ParkingLog[], vehicles: Record<string, Vehicle> }> {
    await delay(400); // Slight delay for realism
    return this.getMockState();
  }

  // --- ACTIONS ---

  async allocateSlot(slot: ParkingSlot, vehicle: Vehicle): Promise<ParkingLog> {
    await delay(500);
    return this.mockAllocate(slot, vehicle);
  }

  async exitSlot(slot: ParkingSlot): Promise<void> {
    await delay(500);
    return this.mockExit(slot);
  }

  // --- LOCAL STORAGE HELPERS ---

  private getMockState() {
    const savedSlots = localStorage.getItem(STORAGE_KEYS.SLOTS);
    const savedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);

    let slots: ParkingSlot[] = savedSlots ? JSON.parse(savedSlots) : initializeParkingDatabase();
    let vehicles: Record<string, Vehicle> = savedVehicles ? JSON.parse(savedVehicles) : {};
    let logs: ParkingLog[] = savedLogs ? JSON.parse(savedLogs) : [];

    // Initialize DB if empty
    if (!savedSlots) {
        localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    }

    return { slots, vehicles, logs };
  }

  private mockAllocate(slot: ParkingSlot, vehicle: Vehicle): ParkingLog {
    const state = this.getMockState();
    const now = new Date();
    
    // Update Vehicle
    state.vehicles[vehicle.vehicleId] = vehicle;
    
    // Update Slot
    state.slots = state.slots.map(s => s.slotId === slot.slotId ? { ...s, status: 'OCCUPIED', vehicleId: vehicle.vehicleId } : s);
    
    // Create Log
    const newLog: ParkingLog = {
        logId: `LOG-${Date.now()}`,
        vehicleId: vehicle.vehicleId,
        slotId: slot.slotId,
        levelId: slot.levelId,
        entryTime: now.toLocaleTimeString('en-US', { hour12: false }),
        status: 'Active',
        vehicleSnapshot: {
            plateNumber: vehicle.plateNumber,
            ownerName: vehicle.ownerName,
            role: vehicle.role,
            phoneNumber: vehicle.phoneNumber
        }
    };
    state.logs.unshift(newLog);

    this.saveMockState(state);
    return newLog;
  }

  private mockExit(slot: ParkingSlot): void {
    const state = this.getMockState();
    if (!slot.vehicleId) return;
    const vehicleId = slot.vehicleId;

    // Close Log
    state.logs = state.logs.map(log => {
        if (log.vehicleId === vehicleId && log.status === 'Active') {
            return { ...log, status: 'Completed', exitTime: new Date().toLocaleTimeString('en-US', { hour12: false }) };
        }
        return log;
    });

    // Free Slot
    state.slots = state.slots.map(s => s.slotId === slot.slotId ? { ...s, status: 'AVAILABLE', vehicleId: undefined } : s);

    this.saveMockState(state);
  }

  private saveMockState(state: { slots: ParkingSlot[], vehicles: Record<string, Vehicle>, logs: ParkingLog[] }) {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(state.slots));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(state.vehicles));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
  }
}

export const api = new ApiClient();
