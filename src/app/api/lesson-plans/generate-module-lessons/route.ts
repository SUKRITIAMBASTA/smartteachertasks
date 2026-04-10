import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import LessonPlan from '@/models/LessonPlan';
import { updateLessonPlan } from '@/lib/controllers/lessonPlanController';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'faculty'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { lessonPlanId, moduleNo, moduleTitle, moduleSummary, duration } = await req.json();

    if (!lessonPlanId || !moduleNo) {
      return NextResponse.json({ error: 'Lesson Plan and Module No are required.' }, { status: 400 });
    }

    await dbConnect();
    const plan = await LessonPlan.findById(lessonPlanId).lean() as any;
    if (!plan) return NextResponse.json({ error: 'Plan not found.' }, { status: 404 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API Key not configured.' }, { status: 500 });

    const prompt = `You are an expert academic faculty and curriculum designer.
Subject: ${plan.subject}
Unit Title: ${moduleTitle}
Unit Summary: ${moduleSummary}
Target Duration: ${duration || '3 Weeks'}

Constraint: Generate a detailed, week-by-week curriculum only for this unit.
Each week should contain 5 days of activities. 
KEEP IT CRISP (approx 15 words per day description).

Return ONLY a valid JSON:
{
  "weeks": [
    {
      "weekNo": 1,
      "moduleNo": ${moduleNo},
      "topic": "Intro to ...",
      "objectives": ["Key Goal 1"],
      "days": [
        "Day 1: Short summary (max 15 words)",
        ... exactly 5 days
      ],
      "summary": "Week goal."
    }
    ... Weeks mapping to ${duration}
  ]
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SmartTeach Module Generator',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error('Detailed lesson generation failed');

    const aiResult = await response.json();
    let lessons: any;
    try {
      lessons = JSON.parse(aiResult.choices[0].message.content);
    } catch {
      throw new Error('AI returned invalid week/day format.');
    }

    // Append these weeks to the existing plan
    // Filter out old weeks for this module if any
    const existingWeeks = plan.weeks || [];
    const otherWeeks = existingWeeks.filter((w: any) => w.moduleNo !== moduleNo);
    const updatedWeeks = [...otherWeeks, ...lessons.weeks].sort((a: any, b: any) => a.weekNo - b.weekNo);

    const updated = await updateLessonPlan(lessonPlanId, { weeks: updatedWeeks });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
