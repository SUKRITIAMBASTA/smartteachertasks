import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Session from '@/models/Session';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import Room from '@/models/Room';
import Schedule from '@/models/Schedule';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to determine if date is valid working day
function isWorkingDay(date: Date, holidays: Date[]) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Weekend
  
  // Check against holidays
  for (const h of holidays) {
     if (
       h.getDate() === date.getDate() &&
       h.getMonth() === date.getMonth() &&
       h.getFullYear() === date.getFullYear()
     ) return false;
  }
  return true;
}

// Generate sequential slots based on shift type (40 min class, 5 min break)
function getSlotsForShift(shift: 'morning' | 'afternoon') {
  if (shift === 'morning') {
    return [
      "08:30-09:10", "09:15-09:55", "10:00-10:40", "10:45-11:25"
    ]; // Morning block
  }
  return [
    "13:00-13:40", "13:45-14:25", "14:30-15:10", "15:15-15:55"
  ];   // Afternoon block
}

// Return inverted lab slots (Morning shift -> Afternoon Lab block)
function getLabSlotsForShift(shift: 'morning' | 'afternoon') {
  return shift === 'morning' ? ["13:00-13:40", "13:45-14:25"] : ["10:00-10:40", "10:45-11:25"];
}

export async function POST(req: Request) {
  try {
    const sessionToken = await getServerSession(authOptions);
    if ((sessionToken?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    const dbSession = await Session.findById(sessionId);
    if (!dbSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    // AI Initialization: Pulling entire contextual domain 
    const subjects = await Subject.find().populate('departmentId');
    const rooms = await Room.find();
    
    const labs = rooms.filter(r => r.type === 'complab');
    const classrooms = rooms.filter(r => r.type === 'classroom');

    // Clean existing pending schedules for this session duration to prevent dupe runs
    await Schedule.deleteMany({
      date: { $gte: dbSession.startDate, $lte: dbSession.endDate },
      status: 'pending_approval'
    });

    const generatedSchedules: any[] = [];
    const facultyDailyCount: Record<string, number> = {};

    // Generate Array of Working Days
    const workingDays: Date[] = [];
    let currTarget = new Date(dbSession.startDate);
    
    while (currTarget <= dbSession.endDate) {
      if (isWorkingDay(currTarget, dbSession.holidays)) {
        workingDays.push(new Date(currTarget));
      }
      currTarget.setDate(currTarget.getDate() + 1);
    }

    // AI Allocation Engine
    for (const sub of subjects) {
       const dept = sub.departmentId as any;
       if (!dept) continue;

       const isLabClass = sub.name.toLowerCase().includes('lab');
       let assignedCount = 0;
       
       const availableDays = [...workingDays];
       // basic uniform randomizer for class dispersion
       availableDays.sort(() => 0.5 - Math.random());

       for (const day of availableDays) {
         if (assignedCount >= sub.requiredClasses) break;

         const dateStr = day.toISOString().split('T')[0];
         const facultyKey = `${sub.assignedFaculty}_${dateStr}`;
         
         // Faculty constraint: max 4 classes per day
         if (facultyDailyCount[facultyKey] >= 4) continue;

         const slots = isLabClass ? getLabSlotsForShift(dept.shift) : getSlotsForShift(dept.shift);
         const availableRooms = isLabClass ? labs : classrooms;
         
         // Basic search for a free slot & room
         let booked = false;
         for (const timeSlot of slots) {
            for (const room of availableRooms) {
               // Check clash checking logic
               const isRoomOccupied = generatedSchedules.some(
                 s => s.date.getTime() === day.getTime() && s.timeSlot === timeSlot && s.roomId.toString() === room._id.toString()
               );
               const isFacultyOccupied = generatedSchedules.some(
                 s => s.date.getTime() === day.getTime() && s.timeSlot === timeSlot && s.facultyId?.toString() === sub.assignedFaculty?.toString()
               );

               if (!isRoomOccupied && !isFacultyOccupied) {
                 generatedSchedules.push({
                   departmentId: dept._id,
                   semester: sub.semester,
                   date: day,
                   timeSlot,
                   subjectId: sub._id,
                   facultyId: sub.assignedFaculty,
                   roomId: room._id,
                   isLab: isLabClass,
                   status: 'pending_approval'
                 });
                 
                 facultyDailyCount[facultyKey] = (facultyDailyCount[facultyKey] || 0) + 1;
                 assignedCount++;
                 booked = true;
                 break;
               }
            }
            if (booked) break;
         }
       }
    }

    if (generatedSchedules.length > 0) {
      await Schedule.insertMany(generatedSchedules);
    }

    return NextResponse.json({ 
       success: true, 
       message: 'AI Schedule Generated', 
       allocations: generatedSchedules.length 
    });

  } catch (error: any) {
    console.error('Schedule gen Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
