
import { AuthUser, ParkingSlot, ParkingLog, Vehicle, Role } from './types';
import { MOCK_USERS_DB, INITIAL_LOGS, STORAGE_KEYS, initializeParkingDatabase } from './constants';

const API_URL = 'http://localhost:4000';

// Helper to simulate delay in mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiClient {
  private useMock: boolean = false;

  constructor() {
    // We optimistically try real backend, but fallback is handled per request or globally after first failure
  }

  // --- HEALTH CHECK ---
  async checkHealth(): Promise<boolean> {
      try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
          
          const res = await fetch(`${API_URL}/health`, { 
              signal: controller.signal,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
          });
          clearTimeout(timeoutId);
          
          const isHealthy = res.ok;
          if (!isHealthy) {
              console.warn(`Backend health check failed with status ${res.status}`);
          }
          return isHealthy;
      } catch (e: any) {
          if (e.name === 'AbortError') {
              console.warn("Backend health check timeout");
          } else {
              console.warn("Backend health check failed:", e?.message || e);
          }
          return false;
      }
  }

  // --- AUTHENTICATION ---

  async login(email: string, password: string): Promise<{ token: string, user: AuthUser }> {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      return await res.json();
    } catch (e) {
      console.warn("Backend offline, using MOCK AUTH");
      await delay(800);
      const user = MOCK_USERS_DB[email];
      if (user && user.passwordHash === password) {
        const { passwordHash, ...safeUser } = user;
        return { token: 'mock-jwt-token-xyz', user: safeUser as AuthUser };
      }
      throw new Error('Invalid credentials');
    }
  }

  async signup(data: any): Promise<{ token: string, user: AuthUser }> {
      try {
          const res = await fetch(`${API_URL}/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Signup failed');
          return await res.json();
      } catch (e) {
          console.warn("Backend offline, using MOCK SIGNUP");
          await delay(800);
          // Create mock user
          const newUser: AuthUser = {
              id: `USR-${Date.now()}`,
              name: data.name,
              email: data.email,
              role: data.role,
              stationId: data.stationId,
              avatarUrl: '',
              lastLogin: new Date().toISOString()
          };
          MOCK_USERS_DB[data.email] = { ...newUser, passwordHash: data.password };
          return { token: 'mock-jwt-token-new', user: newUser };
      }
  }

  // --- DATA FETCHING ---

  async getDashboardState(): Promise<{ slots: ParkingSlot[], logs: ParkingLog[], vehicles: Record<string, Vehicle> }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const res = await fetch(`${API_URL}/dashboard-state`, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      return this.mapBackendToFrontend(data);
    } catch (e) {
      console.warn("Backend offline, using MOCK DB", e);
      return this.getMockState();
    }
  }

  // --- ACTIONS ---

  async allocateSlot(slot: ParkingSlot, vehicle: Vehicle): Promise<ParkingLog> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const res = await fetch(`${API_URL}/allocate-slot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.slotId, 
          slotNumber: slot.slotNumber,
          levelId: slot.levelId,
          vehicleData: vehicle
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('Allocation failed');
      const data = await res.json();
      
      // Map returned log to frontend structure
      const beLog = data.log;
      const feLog: ParkingLog = {
          logId: beLog.id.toString(),
          vehicleId: vehicle.vehicleId, // Frontend ID
          slotId: slot.slotId,
          levelId: slot.levelId,
          entryTime: new Date(beLog.entryTime).toLocaleTimeString(),
          status: 'Active',
          vehicleSnapshot: {
              plateNumber: vehicle.plateNumber,
              ownerName: vehicle.ownerName,
              role: vehicle.role,
              phoneNumber: vehicle.phoneNumber
          }
      };
      
      return feLog;
    } catch (e) {
      console.warn("Backend offline, performing MOCK ALLOCATION", e);
      return this.mockAllocate(slot, vehicle);
    }
  }

  async exitSlot(slot: ParkingSlot): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const res = await fetch(`${API_URL}/exit-slot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.slotId
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('Exit failed');
    } catch (e) {
      console.warn("Backend offline, performing MOCK EXIT", e);
      return this.mockExit(slot);
    }
  }

  // --- MOCK HELPERS ---

  private getMockState() {
    const savedSlots = localStorage.getItem(STORAGE_KEYS.SLOTS);
    const savedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);

    let slots: ParkingSlot[] = savedSlots ? JSON.parse(savedSlots) : initializeParkingDatabase();
    let vehicles: Record<string, Vehicle> = savedVehicles ? JSON.parse(savedVehicles) : {};
    let logs: ParkingLog[] = savedLogs ? JSON.parse(savedLogs) : [];

    if (!savedSlots) localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));

    return { slots, vehicles, logs };
  }

  private mockAllocate(slot: ParkingSlot, vehicle: Vehicle): ParkingLog {
    const state = this.getMockState();
    const now = new Date();
    
    state.vehicles[vehicle.vehicleId] = vehicle;
    state.slots = state.slots.map(s => s.slotId === slot.slotId ? { ...s, status: 'OCCUPIED', vehicleId: vehicle.vehicleId } : s);
    
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

    state.logs = state.logs.map(log => {
        if (log.vehicleId === vehicleId && log.status === 'Active') {
            return { ...log, status: 'Completed', exitTime: new Date().toLocaleTimeString('en-US', { hour12: false }) };
        }
        return log;
    });

    state.slots = state.slots.map(s => s.slotId === slot.slotId ? { ...s, status: 'AVAILABLE', vehicleId: undefined } : s);

    this.saveMockState(state);
  }

  private saveMockState(state: any) {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(state.slots));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(state.vehicles));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
  }

  private mapBackendToFrontend(data: any) {
    // Convert Backend Models to Frontend Types
    const vehicles: Record<string, Vehicle> = {};
    
    const logs: ParkingLog[] = data.logs.map((l: any) => {
        const v = l.vehicle;
        const vId = v ? `VEH-${v.plateNumber}` : `UNKNOWN-${l.id}`;
        
        if (v) {
             vehicles[vId] = {
                 vehicleId: vId,
                 plateNumber: v.plateNumber,
                 ownerName: v.ownerName || 'Unknown',
                 phoneNumber: v.phoneNumber,
                 role: v.role as Role,
                 studentType: v.studentType,
                 photoUrl: `https://ui-avatars.com/api/?name=${v.ownerName}&background=random`,
                 vehicleType: v.vehicleType || "4-Wheeler",
                 entryTime: new Date(l.entryTime).toLocaleTimeString()
             };
        }

        return {
            logId: l.id.toString(),
            vehicleId: vId,
            slotId: l.slotId,
            levelId: l.levelId,
            entryTime: new Date(l.entryTime).toLocaleTimeString(),
            exitTime: l.exitTime ? new Date(l.exitTime).toLocaleTimeString() : undefined,
            status: l.exitTime ? 'Completed' : 'Active',
            vehicleSnapshot: {
                plateNumber: v?.plateNumber || 'Unknown',
                ownerName: v?.ownerName || 'Unknown',
                role: v?.role as Role || 'VISITOR',
                phoneNumber: v?.phoneNumber || ''
            }
        };
    });

    const slots: ParkingSlot[] = data.slots.map((s: any) => ({
        slotId: s.slotId,
        levelId: s.levelId,
        slotNumber: s.slotNumber,
        status: s.status,
        category: s.category,
        vehicleId: s.status === 'OCCUPIED' ? findVehicleIdForSlot(s.slotId, logs) : undefined
    }));

    return { slots, logs, vehicles };
  }
}

function findVehicleIdForSlot(slotId: string, logs: ParkingLog[]) {
    const activeLog = logs.find(l => l.slotId === slotId && l.status === 'Active');
    return activeLog ? activeLog.vehicleId : undefined;
}

export const api = new ApiClient();
