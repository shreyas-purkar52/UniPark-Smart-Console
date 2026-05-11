
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const SECRET = "unipark_super_secret_key_2024";

app.use(cors());
app.use(express.json());

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date() });
});

// --- AUTHENTICATION ---

app.post('/signup', async (req, res) => {
  const { name, email, password, role, stationId } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, stationId }
    });
    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '12h' });
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "User already exists or invalid data" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '12h' });
    const { password: _, ...safeUser } = user;
    
    res.json({ token, user: safeUser });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- CORE PARKING LOGIC ---

// Get complete dashboard state (Slots + History + Vehicles)
app.get('/dashboard-state', async (req, res) => {
  try {
    // 1. Get All Slots
    const slots = await prisma.slot.findMany();
    
    // 2. Get Recent Logs (Active + Last 50 completed)
    const logs = await prisma.log.findMany({
      orderBy: { entryTime: 'desc' },
      take: 100,
      include: {
        vehicle: true // Join vehicle data for logs
      }
    });
    
    // 3. Extract unique vehicles from logs for frontend cache
    const vehicles = {};
    logs.forEach(log => {
      if (log.vehicle) {
        vehicles[log.vehicle.plateNumber] = log.vehicle;
      }
    });

    res.json({ slots, logs, vehicles });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Allocate Slot
app.post('/allocate-slot', async (req, res) => {
  const { slotId, slotNumber, levelId, vehicleData } = req.body;
  // vehicleData: { plateNumber, ownerName, phoneNumber, role, studentType }

  try {
    // 1. Find or Create Vehicle
    let vehicle = await prisma.vehicle.findUnique({ where: { plateNumber: vehicleData.plateNumber } });
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          plateNumber: vehicleData.plateNumber,
          ownerName: vehicleData.ownerName,
          phoneNumber: vehicleData.phoneNumber,
          role: vehicleData.role,
          studentType: vehicleData.studentType,
          vehicleType: vehicleData.vehicleType || "4-Wheeler"
        }
      });
    } else {
        // Update existing vehicle metadata if changed
        vehicle = await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: {
                ownerName: vehicleData.ownerName,
                phoneNumber: vehicleData.phoneNumber,
                role: vehicleData.role,
                studentType: vehicleData.studentType
            }
        });
    }

    // 2. Update Slot
    // Note: In real app we use composite key or findUnique by slotId string
    await prisma.slot.update({
      where: { slotId: slotId },
      data: { status: 'OCCUPIED' }
    });

    // 3. Create Log
    const log = await prisma.log.create({
      data: {
        vehicleId: vehicle.id,
        slotId: slotId,
        levelId,
        entryTime: new Date(),
        status: 'Active'
      },
      include: { vehicle: true }
    });

    res.json({ success: true, log, vehicle });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Allocation failed" });
  }
});

// Exit Slot
app.post('/exit-slot', async (req, res) => {
  const { slotId } = req.body;

  try {
    // 1. Find active log for this slot
    const activeLog = await prisma.log.findFirst({
      where: {
        slotId: slotId,
        exitTime: null
      }
    });

    if (activeLog) {
      await prisma.log.update({
        where: { id: activeLog.id },
        data: { 
            exitTime: new Date(),
            status: 'Completed'
        }
      });
    }

    // 2. Free Slot
    await prisma.slot.update({
      where: { slotId: slotId },
      data: { status: 'AVAILABLE' }
    });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Exit process failed" });
  }
});

// Initialize Slots (Seeding Endpoint)
app.post('/seed-slots', async (req, res) => {
    const count = await prisma.slot.count();
    if (count > 0) return res.json({ message: "Slots already seeded" });

    const levels = [
        { id: 1, name: 'Level 01', category: 'MIXED' },
        { id: 2, name: 'Level 02', category: 'STUDENT' },
        { id: 3, name: 'Level 03', category: 'STUDENT' },
        { id: 4, name: 'Level 04', category: 'STUDENT' },
        { id: 5, name: 'Level 05', category: 'VISITOR' },
    ];

    for (const level of levels) {
        for (let i = 0; i < 50; i++) { // Seeding 50 per level for demo speed
            const slotNum = 101 + i;
            await prisma.slot.create({
                data: {
                    slotId: `${level.id}-${slotNum}`,
                    levelId: level.id,
                    slotNumber: slotNum,
                    status: 'AVAILABLE',
                    category: level.category
                }
            });
        }
    }
    res.json({ message: "Seeded 250 slots" });
});

app.listen(4000, () => console.log("✅ UniPark Backend running on http://localhost:4000"));
