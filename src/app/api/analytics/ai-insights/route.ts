import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getAnalyticsSummary, 
  getEarlyWarningData,
  getPerformanceTrends
} from '@/lib/controllers/analyticsController';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'faculty'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [summary, warnings, trends] = await Promise.all([
      getAnalyticsSummary(),
      getEarlyWarningData(),
      getPerformanceTrends()
    ]);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_OPENROUTER_KEY')) {
      return NextResponse.json({ 
        summary, 
        warnings, 
        insight: "AI Insight simulation: Class performance is stable, but individual attention is needed for students with declining attendance. Focus on interactive group activities." 
      });
    }

    const prompt = `Act as an expert educational consultant. Analyze the following class data and provide a concise "Teacher's Brief".
    
Data Summary:
- Average Attendance: ${summary.avgAttendance}%
- Average Grade: ${summary.avgScore}%
- Assessments Completed: ${summary.totalAssessments}
- Students Needing Attention: ${warnings.length}
- Recent Trend: ${trends.length > 0 ? trends[trends.length-1].average + '%' : 'N/A'}

Provide:
1. A 2-sentence summary of overall class health.
2. Two specific pedagogical recommendations to improve the current situation.
3. Keep it professional, encouraging, and actionable.
4. Return ONLY the insight text.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "SmartTeach Support System"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat",
        "messages": [
          { "role": "user", "content": prompt }
        ],
        "max_tokens": 500
      })
    });

    if (!response.ok) {
       return NextResponse.json({ 
        summary, 
        warnings, 
        insight: "AI Analysis currently unavailable. Focus on maintaining current benchmarks." 
      });
    }

    const aiResult = await response.json();
    const insight = aiResult.choices[0].message.content.trim();

    return NextResponse.json({
      summary,
      warnings,
      insight
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
