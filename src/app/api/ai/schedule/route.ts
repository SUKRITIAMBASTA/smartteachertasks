import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import User from '@/models/User';
import Room from '@/models/Room';
import Schedule from '@/models/Schedule';
import Department from '@/models/Department';

/**
 * 🤖 Institutional AI Scheduling Orchestrator
 * Generates Cross-departmental Routines, Mid-Sem, and End-Sem calendars.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { numClassrooms, numLabs, type } = await req.json(); // type: 'routine' | 'midsem' | 'endsem'

    // 1. Load Institutional Context
    const subjects = await Subject.find().lean();
    const facultyPool = await User.find({ role: 'faculty' }).lean();
    const departments = await Department.find().lean();
    const classrooms = await Room.find({ type: 'classroom' }).limit(numClassrooms || 30).lean();
    const labs = await Room.find({ type: 'complab' }).limit(numLabs || 5).lean();

    console.log(`[AI Orchestrator] Context: ${subjects.length} Subjects, ${facultyPool.length} Faculty, ${classrooms.length} Classrooms, ${labs.length} Labs`);

    if (!classrooms.length || !subjects.length || !facultyPool.length) {
      const missing = [];
      if (!classrooms.length) missing.push('Classrooms');
      if (!subjects.length) missing.push('Subjects');
      if (!facultyPool.length) missing.push('Faculty');
      return NextResponse.json({ error: `Institutional registry too sparse: Missing ${missing.join(', ')}` }, { status: 400 });
    }

    // 2. Clear ONLY the target type to prevent data loss across modes
    const targetType = type || 'routine';
    await Schedule.deleteMany({ type: targetType }); 

    const newSchedules = [];
    const configuration = {
      routine: { 
        slots: [
          '8:30 am-9:15 am', '9:20 am-10:05 am', '10:10 am-10:55 am', '11:00 am-11:45 am', '11:50 am-12:35 pm', 
          '1:00 pm-1:45 pm', '1:50 pm-2:35 pm', '2:40 pm-3:25 pm', '3:30 pm-4:15 pm', '4:20 pm-5:05 pm'
        ], 
        days: [1, 2, 3, 4, 5], 
        labs: true,
        shifts: ['morning', 'evening'] 
      },
      midsem: { 
        slots: ['10:00am-12:30pm', '01:30pm-04:00pm'], 
        days: [10, 11, 12, 13, 14, 15], 
        labs: false,
        shifts: ['morning'] // Exams usually single shift or slot-based
      },
      endsem: { 
        slots: ['10:00am-01:00pm'], 
        days: [20, 22, 24, 26, 28, 30, 32, 34, 36, 38], 
        labs: false,
        shifts: ['morning']
      }
    };

    const config = configuration[type as keyof typeof configuration] || configuration.routine;
    let subjectIdx = 0;

    // 2.5 Active Session Detection
    const Session = (await import('@/models/Session')).default;
    const activeSession = await Session.findOne({ isActive: true }).lean();
    const isOddSession = activeSession?.type === 'odd' || true; // Default to odd as per user request

    console.log(`[AI Orchestrator] Session: ${activeSession?.name || 'Manual'} (${isOddSession ? 'ODD' : 'EVEN'})`);

    // 3. AI Allocation Algorithm
    for (const dayOffset of config.days) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + dayOffset);

      for (const slot of config.slots) {
        for (const shift of config.shifts) {
          let roomIdx = 0;
          
          for (const dept of departments) {
            // Filter subjects by Department + Session (Odd/Even) + Shift
            const applicableSubjects = subjects.filter(s => {
              const sem = s.semester || 1;
              const matchesDept = s.departmentId.toString() === dept._id.toString();
              const matchesSession = s.session === (isOddSession ? 'odd' : 'even');
              
              if (!matchesDept || !matchesSession) return false;

              // Amity Logic: 
              // Odd: Morning (Sem 1, 7) | Evening (Sem 3, 5)
              if (isOddSession) {
                const isFirstHalf = config.slots.indexOf(slot) < 5;
                if (shift === 'morning' && isFirstHalf) return [1, 7].includes(sem);
                if (shift === 'evening' && !isFirstHalf) return [3, 5].includes(sem);
              } else {
                if (shift === 'morning') return [2, 6, 8].includes(sem);
                if (shift === 'evening') return [4].includes(sem);
              }
              
              return false;
            });

            if (applicableSubjects.length === 0) continue;

            const sub = applicableSubjects[subjectIdx % applicableSubjects.length];
            
            // 👮 Faculty Allotment Logic:
            let allottedFaculty;
            if (type === 'routine') {
               allottedFaculty = facultyPool.find(f => f._id.toString() === sub.assignedFaculty?.toString()) || facultyPool[0];
            } else {
               allottedFaculty = facultyPool.find(f => f.institution !== dept.institution) || facultyPool[(subjectIdx + 5) % facultyPool.length];
            }

            const isLab = config.labs && sub.name.toLowerCase().includes('lab');
            const room = isLab ? labs[roomIdx % labs.length] : classrooms[roomIdx % classrooms.length];

            if (room && sub) {
               newSchedules.push({
                  departmentId: dept._id,
                  type: type || 'routine',
                  semester: sub.semester || 1,
                  date: currentDate,
                  timeSlot: slot,
                  shift: shift,
                  subjectId: sub._id,
                  facultyId: allottedFaculty._id,
                  roomId: room._id,
                  isLab: isLab,
                  status: 'pending_approval'
               });
               subjectIdx++;
               roomIdx++;
            }
            if (roomIdx >= classrooms.length) break;
          }
        }
      }
    }

    // 4. Persistence
    const result = await Schedule.insertMany(newSchedules);

    return NextResponse.json({ 
      success: true, 
      message: `${type ? type.toUpperCase() : 'ROUTINE'} Generated with ${result.length} Institutional Allocations`, 
      count: result.length 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
