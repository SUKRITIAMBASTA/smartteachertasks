import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getAttendanceStats, 
  getMarksDistribution, 
  getPerformanceTrends,
  getAnalyticsSummary
} from '@/lib/controllers/analyticsController';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'faculty'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [attendance, distribution, trends, summary] = await Promise.all([
      getAttendanceStats(14),
      getMarksDistribution(),
      getPerformanceTrends(),
      getAnalyticsSummary()
    ]);

    return NextResponse.json({
      attendance,
      distribution,
      trends,
      summary
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
