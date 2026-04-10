import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Syllabus from '@/models/Syllabus';
import Subject from '@/models/Subject';
import User from '@/models/User';
import Department from '@/models/Department'; 
import mongoose from 'mongoose';

/* ─────────────────────────────────────────────
   GET /api/syllabus?subjectId=...
   GET /api/syllabus?semester=...
   GET /api/syllabus          ← all (admin)
───────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  try {
    // 1. Connect to DB
    await dbConnect();
    
    // 2. Ensure models are registered (sometimes Next.js model caching is tricky)
    // We do this by simply referencing the imported models
    const _subject = Subject;
    const _dept = Department;
    const _userModel = User;

    // 3. Get Session safely
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (authError) {
      console.error('AUTH_SESSION_ERROR:', authError);
      return NextResponse.json({ error: 'Auth session failure' }, { status: 401 });
    }

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const semester  = searchParams.get('semester');

    const query: any = {};
    if (subjectId) query.subjectId = subjectId;
    if (semester) {
      const sem = parseInt(semester);
      if (!isNaN(sem)) query.semester = sem;
    }

    // 4. Role-based filtering
    const userRole = (session.user as any)?.role;
    if (userRole === 'student') query.approvalStatus = 'published';

    // 5. Fetch and Populate
    const syllabi = await Syllabus.find(query)
      .populate({ path: 'subjectId', select: 'name code semester' })
      .populate({ path: 'departmentId', select: 'name branch' })
      .populate({ path: 'createdBy', select: 'name email' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(syllabi || []);
  } catch (e: any) {
    console.error('API_SYLLABUS_GET_CRITICAL_ERROR:', e.message, e.stack);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: e.message,
      path: 'GET /api/syllabus'
    }, { status: 500 });
  }
}

/* ─────────────────────────────────────────────
   POST /api/syllabus  { subjectId, ... }
   Generates via AI if content not provided
───────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || !['faculty', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { subjectId, generateWithAI = true, ...manualContent } = body;

    if (!subjectId) return NextResponse.json({ error: 'subjectId is required' }, { status: 400 });

    const subjectDoc = await Subject.findById(subjectId).lean() as any;
    if (!subjectDoc) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    const facultyUser = await User.findById(user.id).lean() as any;

    let syllabusData: any = {
      subjectId,
      departmentId: subjectDoc.departmentId,
      semester:     subjectDoc.semester,
      createdBy:    user.id,
      ...manualContent,
    };

    if (generateWithAI) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey || apiKey.includes('YOUR_OPENROUTER_KEY')) {
        return NextResponse.json({ error: 'OpenRouter API key not configured.' }, { status: 500 });
      }

      const prompt = `You are an expert curriculum designer at Amity University Patna.
Design a comprehensive, university-grade syllabus for the following subject:

Subject Name: ${subjectDoc.name}
Subject Code: ${subjectDoc.code}
Semester: ${subjectDoc.semester}
Credit Hours: ${subjectDoc.credits || 3}
Department: ${subjectDoc.departmentId}

Generate a detailed, professionally structured syllabus with:
1. A concise course description (2-3 sentences)
2. Pedagogy section (teaching methods, assessment approach)  
3. 3-5 Professional Skill Development Activities (PSDA) - concise bullet points
4. 4-5 course modules/units with topic lists and hours
5. 8-10 mandatory lab/practical experiments with title + description
6. 2-3 optional/additional experiments
7. 2-3 recommended textbooks
8. 2-3 reference books

Return ONLY valid JSON matching this EXACT schema:
{
  "courseDescription": "...",
  "creditHours": 3,
  "pedagogy": "The course will be delivered through interactive lectures, live coding, and hands-on lab sessions. Case-based learning and mini-projects will enhance practical understanding...",
  "psda": ["Minor Project / Minor Experiments", "Group Presentation", "Conceptual Quizzes", "Lab Record Submission"],
  "modules": [
    { "unitNo": 1, "title": "Unit Title", "topics": ["Topic 1", "Topic 2"], "hours": 10 }
  ],
  "mandatoryExperiments": [
    { "no": 1, "title": "Experiment Title", "description": "Detailed description of what students implement..." }
  ],
  "optionalExperiments": [
    { "no": 1, "title": "Optional Experiment", "description": "..." }
  ],
  "textbooks": ["Book Title by Author (Publisher, Year)"],
  "references": ["Reference Book by Author (Publisher, Year)"]
}`;

      const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'SmartTeach Syllabus Engine',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 3500,
          response_format: { type: 'json_object' },
        }),
      });

      if (!aiRes.ok) {
        const err = await aiRes.json();
        throw new Error(err.error?.message || 'AI syllabus generation failed');
      }

      const aiData = await aiRes.json();
      let aiContent: any;
      try {
        aiContent = JSON.parse(aiData.choices[0].message.content);
      } catch {
        throw new Error('AI returned malformed JSON — retry generation.');
      }

      syllabusData = { ...syllabusData, ...aiContent };
    }

    // Upsert: replace existing syllabus for this subject if it exists
    const existing = await Syllabus.findOne({ subjectId });
    let savedSyllabus;
    if (existing) {
      Object.assign(existing, syllabusData);
      savedSyllabus = await existing.save();
    } else {
      savedSyllabus = await Syllabus.create(syllabusData);
    }

    // Also update Subject.syllabus text field for backward compat with lesson plan generator
    const summaryText = buildSyllabusText(syllabusData);
    await Subject.findByIdAndUpdate(subjectId, { syllabus: summaryText });

    // Ensure models are registered for population
    const _s = Subject;
    const _d = Department;

    const populated = await Syllabus.findById(savedSyllabus._id)
      .populate({ path: 'subjectId', select: 'name code semester' })
      .populate({ path: 'departmentId', select: 'name branch' })
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ─────────────────────────────────────────────
   PATCH /api/syllabus?id=...  (manual edit)
───────────────────────────────────────────── */
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || !['faculty', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id   = new URL(req.url).searchParams.get('id');
    const body = await req.json();
    if (!id) return NextResponse.json({ error: 'Syllabus ID required' }, { status: 400 });

    // Ensure models are registered
    const _s = Subject;

    const updated = await Syllabus.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      .populate({ path: 'subjectId', select: 'name code semester' })
      .lean();

    if (!updated) return NextResponse.json({ error: 'Syllabus not found' }, { status: 404 });

    // Sync back to Subject
    const text = buildSyllabusText(body);
    if ((updated as any).subjectId) {
      await Subject.findByIdAndUpdate((updated as any).subjectId._id || (updated as any).subjectId, { syllabus: text });
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ─────────────────────────────────────────────
   DELETE /api/syllabus?id=...
───────────────────────────────────────────── */
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user || !['faculty', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await Syllabus.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ── Helper: compile syllabus to plain text for Subject.syllabus ── */
function buildSyllabusText(s: any): string {
  const parts: string[] = [];
  if (s.courseDescription) parts.push(`Course Description: ${s.courseDescription}`);
  if (s.pedagogy) parts.push(`\nPedagogy: ${s.pedagogy}`);
  if (s.psda?.length) parts.push(`\nPSDA:\n${s.psda.map((p: string) => `• ${p}`).join('\n')}`);
  if (s.modules?.length) {
    parts.push('\nCourse Modules:');
    s.modules.forEach((m: any) => {
      parts.push(`Unit ${m.unitNo}: ${m.title} (${m.hours}h)\n  Topics: ${m.topics?.join(', ')}`);
    });
  }
  if (s.mandatoryExperiments?.length) {
    parts.push('\nMandatory Experiments:');
    s.mandatoryExperiments.forEach((e: any) => {
      parts.push(`Experiment ${e.no}: ${e.title}\n  ${e.description}`);
    });
  }
  if (s.textbooks?.length) parts.push(`\nTextbooks:\n${s.textbooks.map((t: string) => `• ${t}`).join('\n')}`);
  return parts.join('\n');
}
