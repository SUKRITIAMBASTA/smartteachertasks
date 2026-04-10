import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLessonPlan, getLessonPlans, updateLessonPlan, deleteLessonPlan } from '@/lib/controllers/lessonPlanController';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Syllabus from '@/models/Syllabus';

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

    const { subjectId, duration, syllabusContext } = await req.json();

    if (!subjectId || !duration) {
      return NextResponse.json({ error: 'Subject and duration are required.' }, { status: 400 });
    }

    await dbConnect();

    // Resolve subject details from DB
    const subjectDoc = await Subject.findById(subjectId).lean() as any;
    if (!subjectDoc) {
      return NextResponse.json({ error: 'Subject not found in academic registry.' }, { status: 404 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_OPENROUTER_KEY')) {
      return NextResponse.json({ error: 'OpenRouter API Key not configured in environment.' }, { status: 500 });
    }

    // Priority: 1) uploaded PDF context, 2) Syllabus collection, 3) Subject.syllabus string
    let syllabusText = syllabusContext || '';
    let structuredSyllabus: any = null;

    if (!syllabusText) {
      structuredSyllabus = await Syllabus.findOne({ subjectId }).lean() as any;
      if (structuredSyllabus) {
        // Build rich context from structured syllabus
        const parts: string[] = [`Course: ${subjectDoc.name} (${subjectDoc.code}) — Semester ${subjectDoc.semester}`];
        if (structuredSyllabus.courseDescription) parts.push(`Description: ${structuredSyllabus.courseDescription}`);
        if (structuredSyllabus.pedagogy) parts.push(`\nPedagogy: ${structuredSyllabus.pedagogy}`);
        if (structuredSyllabus.modules?.length) {
          parts.push('\nCourse Modules:');
          structuredSyllabus.modules.forEach((m: any) => {
            parts.push(`Unit ${m.unitNo} (${m.hours}h): ${m.title} — Topics: ${m.topics?.join(', ')}`);
          });
        }
        if (structuredSyllabus.mandatoryExperiments?.length) {
          parts.push('\nLab Experiments:');
          structuredSyllabus.mandatoryExperiments.slice(0, 10).forEach((e: any) => {
            parts.push(`Exp ${e.no}: ${e.title} — ${e.description.substring(0, 100)}...`);
          });
        }
        syllabusText = parts.join('\n');
      } else {
        syllabusText = subjectDoc.syllabus || `Standard institutional syllabus for ${subjectDoc.name}, Semester ${subjectDoc.semester}.`;
      }
    }

    const subjectName = subjectDoc.name;
    const semesterNo  = subjectDoc.semester;

    const prompt = `You are an expert academic curriculum designer.
Generate a CRISP, high-density FULL-SEMESTER (15-week) lesson plan for:

Subject: ${subjectName}
Semester: ${semesterNo}
Weekly Format: ${duration}
Syllabus Reference: ${syllabusText.substring(0, 3000)}

Constraint: KEEP IT CRISP. Individual day descriptions MUST NOT exceed 15 words. Focus on core topics.

Return ONLY a valid JSON:
{
  "weeks": [
    {
      "weekNo": 1,
      "moduleNo": 1, 
      "topic": "Intro to ...",
      "objectives": ["Key Goal 1"],
      "days": [
        "Day 1: Short summary (max 15 words)",
        "Day 2: Short summary (max 15 words)",
        "Day 3: Short summary (max 15 words)",
        "Day 4: Short summary (max 15 words)",
        "Day 5: Short summary (max 15 words)"
      ],
      "summary": "Concise week goal."
    }
    ... Weeks 1-15
  ],
  "modules": [
    { "moduleNo": 1, "title": "Unit Title", "summary": "Goal...", "duration": "X Weeks" }
  ],
  "months": [
    { "monthNo": 1, "title": "Foundation", "summary": "Summary...", "weekRange": "W1-4" }
  ],
  "assessment": "Brief assessment roadmap."
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SmartTeach Institutional Platform',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'AI generation failed');
    }

    const aiResult = await response.json();
    let rawContent = aiResult.choices[0].message.content;
    let planContent: any;
    
    try {
      // 🚀 Robust JSON extraction: Handle prose or markdown blocks
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      const cleanedJson = jsonMatch ? jsonMatch[0] : rawContent;
      planContent = JSON.parse(cleanedJson);
    } catch {
      console.error('FAILED RAW AI RESPONSE:', rawContent);
      throw new Error('AI returned malformed JSON. Please try again with a shorter subject name.');
    }

    const savedPlan = await createLessonPlan({
      subject: subjectName,
      topic: `Full Semester Plan: ${subjectName} (Sem ${semesterNo})`,
      duration,
      objectives: [], 
      activities: [], 
      assessment: planContent.assessment || '',
      weeks: planContent.weeks || [],
      modules: planContent.modules || [],
      months: planContent.months || [],
      weekSummary: `A comprehensive 15-week roadmap grouped by syllabus units for ${subjectName}.`,
      subjectId: subjectDoc._id,
      semester: semesterNo,
      createdBy: (session.user as any).id,
    });

    return NextResponse.json(savedPlan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, ...updateData } = await req.json();
    if (!id) return NextResponse.json({ error: 'Plan ID required.' }, { status: 400 });

    const updated = await updateLessonPlan(id, updateData);
    return NextResponse.json(updated);
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
    if (!id) return NextResponse.json({ error: 'Plan ID required.' }, { status: 400 });

    await deleteLessonPlan(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
