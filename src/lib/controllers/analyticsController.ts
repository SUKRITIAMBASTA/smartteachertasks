import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';
import Grade from '@/models/Grade';
import Rubric from '@/models/Rubric';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function getAttendanceStats(days: number = 7) {
  await dbConnect();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await Attendance.aggregate([
    { $match: { date: { $gte: startDate } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
        late: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return stats.map(s => ({
    name: s._id,
    Present: s.present,
    Absent: s.absent,
    Late: s.late
  }));
}

export async function getMarksDistribution() {
  await dbConnect();
  
  const grades = await Grade.find().lean();
  
  const ranges = {
    'A (80-100)': 0,
    'B (60-80)': 0,
    'C (40-60)': 0,
    'D (20-40)': 0,
    'F (0-20)': 0
  };
  
  grades.forEach((g: any) => {
    const percentage = (g.totalScore / (g.maxTotalScore || 100)) * 100;
    if (percentage >= 80) ranges['A (80-100)']++;
    else if (percentage >= 60) ranges['B (60-80)']++;
    else if (percentage >= 40) ranges['C (40-60)']++;
    else if (percentage >= 20) ranges['D (20-40)']++;
    else ranges['F (0-20)']++;
  });
  
  return Object.entries(ranges).map(([name, value]) => ({ name, value }));
}

export async function getPerformanceTrends() {
  await dbConnect();
  
  const trends = await Grade.aggregate([
    {
      $group: {
        _id: "$rubricId",
        avgScore: { $avg: { $divide: ["$totalScore", { $cond: [{ $eq: ["$maxTotalScore", 0] }, 1, "$maxTotalScore"] }] } },
        date: { $first: "$createdAt" }
      }
    },
    { $sort: { date: 1 } },
    {
      $lookup: {
        from: 'rubrics',
        localField: '_id',
        foreignField: '_id',
        as: 'rubric'
      }
    },
    { $unwind: "$rubric" }
  ]);
  
  return trends.map(t => ({
    name: t.rubric.title,
    average: Math.round(t.avgScore * 100)
  }));
}

export async function getAnalyticsSummary() {
  await dbConnect();
  
  const totalStudents = await Attendance.distinct('studentId').catch(() => []);
  const avgAttendanceResult = await Attendance.aggregate([
    { $group: { _id: null, avg: { $avg: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } } } }
  ]);
  
  const averageGradeResult = await Grade.aggregate([
    { $group: { _id: null, avg: { $avg: { $divide: ["$totalScore", { $cond: [{ $eq: ["$maxTotalScore", 0] }, 1, "$maxTotalScore"] }] } } } }
  ]);
  
  const totalAssessments = await Rubric.countDocuments();
  
  return {
    totalStudents: totalStudents.length,
    avgAttendance: Math.round((avgAttendanceResult[0]?.avg || 0) * 100),
    avgScore: Math.round((averageGradeResult[0]?.avg || 0) * 100),
    totalAssessments
  };
}

// --- NEW EARLY WARNING & INSIGHTS LOGIC ---

export async function getEarlyWarningData() {
  await dbConnect();

  // 1. Find students with attendance < 75%
  const attendanceRisk = await Attendance.aggregate([
    {
      $group: {
        _id: "$studentId",
        totalDays: { $count: {} },
        presentCount: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } }
      }
    },
    {
      $project: {
        attendancePercentage: { $multiply: [{ $divide: ["$presentCount", "$totalDays"] }, 100] }
      }
    },
    { $match: { attendancePercentage: { $lt: 75 } } }
  ]);

  // 2. Find students with average grade < 40%
  const gradeRisk = await Grade.aggregate([
    {
      $group: {
        _id: "$studentName", // Grouping by name as Grade model doesn't consistently store ID
        avgPercentage: { $avg: { $multiply: [{ $divide: ["$totalScore", { $cond: [{ $eq: ["$maxTotalScore", 0] }, 1, "$maxTotalScore"] }] }, 100] } }
      }
    },
    { $match: { avgPercentage: { $lt: 40 } } }
  ]);

  // Combine and fetch student details if possible
  const combined = [];
  
  for (const risk of attendanceRisk) {
    const student = await User.findById(risk._id).select('name email').lean();
    if (student) {
        combined.push({
            name: student.name,
            reason: 'low_attendance',
            details: `${Math.round(risk.attendancePercentage)}% Attendance`,
            level: 'urgent'
        });
    }
  }

  for (const risk of gradeRisk) {
    // Only add if not already in list or add separate reason
    combined.push({
        name: risk._id,
        reason: 'low_grades',
        details: `${Math.round(risk.avgPercentage)}% Grade Average`,
        level: 'high'
    });
  }

  return combined;
}
