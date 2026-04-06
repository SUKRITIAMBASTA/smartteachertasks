import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import FacultyLeave from '@/models/FacultyLeave';
import Schedule from '@/models/Schedule';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const sessionToken = await getServerSession(authOptions);
    if ((sessionToken?.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leaveId } = await req.json();

    const leave = await FacultyLeave.findById(leaveId);
    if (!leave) return NextResponse.json({ error: 'Leave not found' }, { status: 404 });

    // Mark as approved 
    leave.status = 'approved';
    await leave.save();

    // AI Logic: Find impacted schedule slots and adjust
    const startOfDay = new Date(leave.date);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(leave.date);
    endOfDay.setHours(23,59,59,999);

    const impactedClasses = await Schedule.find({
      facultyId: leave.facultyId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (impactedClasses.length === 0) {
      return NextResponse.json({ success: true, message: 'Leave approved, no classes impacted.' });
    }

    let adjustmentCount = 0;

    // AI Adjustment Simulation: We will just push the class out to a future date as "adjusted" pending admin review
    for (const cls of impactedClasses) {
      // Find the next available working date that isn't the current leave date
      // In a real robust system we'd iterate over session dates, but here we just shift it by a week for prototyping
      const nextWeekDate = new Date(cls.date);
      nextWeekDate.setDate(nextWeekDate.getDate() + 7);
      
      // We change the existing node rather than dropping it
      cls.date = nextWeekDate;
      cls.status = 'adjusted'; 
      await cls.save();
      adjustmentCount++;
    }

    return NextResponse.json({ 
       success: true, 
       message: 'Leave approved and schedule artificially adjusted via AI.',
       classesShifted: adjustmentCount
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
