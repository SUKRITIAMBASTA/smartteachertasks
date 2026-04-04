import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLessonPlan, getLessonPlans, deleteLessonPlan } from '@/lib/controllers/lessonPlanController';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const plans = await getLessonPlans((session.user as any).id, (session.user as any).role);
    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'faculty'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { subject, topic, duration } = await req.json();

    if (!subject || !topic || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_OPENROUTER_KEY')) {
      return NextResponse.json({ error: 'OpenRouter API Key not configured' }, { status: 500 });
    }

    const prompt = `Generate a college-level lesson plan for the following:
Subject: ${subject}
Topic: ${topic}
Duration: ${duration}

Return the response ONLY as a JSON object with the following structure:
{
  "objectives": ["string"],
  "activities": [{"time": "string", "description": "string"}],
  "assessment": "string"
}`;

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
        "max_tokens": 1000,
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "AI Generation failed");
    }

    const aiResult = await response.json();
    const planContent = JSON.parse(aiResult.choices[0].message.content);

    const savedPlan = await createLessonPlan({
      subject,
      topic,
      duration,
      ...planContent,
      createdBy: (session.user as any).id
    });

    return NextResponse.json(savedPlan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await deleteLessonPlan(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
