import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subject from '@/models/Subject';
import Quiz from '@/models/Quiz';
import Syllabus from '@/models/Syllabus';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['faculty', 'admin'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Faculty or Admin access required.' }, { status: 403 });
    }

    const { subjectId, numQuestions, difficulty, moduleNo, topicFilter, save = true } = await req.json();

    if (!subjectId) {
      return NextResponse.json({ error: 'subjectId is required.' }, { status: 400 });
    }

    await dbConnect();

    // Resolve subject
    const subjectDoc = await Subject.findById(subjectId).lean() as any;
    if (!subjectDoc) {
      return NextResponse.json({ error: 'Subject not found in academic registry.' }, { status: 404 });
    }

    // 🔥 RBAC Check: Faculty can only generate quizzes for their own subjects
    const user = session.user as any;
    if (user.role === 'faculty' && subjectDoc.assignedFaculty?.toString() !== user.id) {
      return NextResponse.json({ error: 'Access denied: You are not assigned to this subject.' }, { status: 403 });
    }

    // Resolve structured syllabus for richer AI context
    const structuredSyllabus = await Syllabus.findOne({ subjectId }).lean() as any;
    let syllabusContext = '';
    let targetModuleName = '';
    
    if (structuredSyllabus) {
      const parts = [
        `Description: ${structuredSyllabus.courseDescription || ''}`,
        `Pedagogy: ${structuredSyllabus.pedagogy || ''}`,
      ];

      // If moduleNo is specified, focus on that specific module
      if (moduleNo && structuredSyllabus.modules?.length) {
        const targetModule = structuredSyllabus.modules.find((m: any) => m.unitNo === moduleNo);
        if (targetModule) {
          targetModuleName = targetModule.title;
          parts.push(`\nFOCUS MODULE — Unit ${targetModule.unitNo}: ${targetModule.title}`);
          parts.push(`Topics to test: ${targetModule.topics?.join(', ')}`);
          parts.push(`Hours allocated: ${targetModule.hours}h`);
        }
      } else if (structuredSyllabus.modules?.length) {
        parts.push('Course Modules:');
        structuredSyllabus.modules.forEach((m: any) => {
          parts.push(`Unit ${m.unitNo}: ${m.title} - Topics: ${m.topics?.join(', ')}`);
        });
      }

      // If topicFilter provided, add it as focus
      if (topicFilter) {
        parts.push(`\nSPECIFIC TOPIC FOCUS: ${topicFilter}`);
      }

      syllabusContext = parts.join('\n');
    } else {
      syllabusContext = subjectDoc.syllabus || `Standard syllabus for ${subjectDoc.name}, Semester ${subjectDoc.semester}`;
    }

    const userId = (session.user as any).id;
    const totalQ  = numQuestions || 10;
    const easyCount   = Math.ceil(totalQ * 0.3);
    const mediumCount = Math.ceil(totalQ * 0.4);
    const hardCount   = totalQ - easyCount - mediumCount;
    const diffLabel = difficulty || 'balanced';

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_OPENROUTER_KEY')) {
      return NextResponse.json({ error: 'OpenRouter API key not configured.' }, { status: 500 });
    }

    const moduleContext = moduleNo 
      ? `\nIMPORTANT: Generate questions ONLY about Unit ${moduleNo}${targetModuleName ? ` (${targetModuleName})` : ''}. Do NOT include questions from other units.`
      : '';
    const topicContext = topicFilter 
      ? `\nIMPORTANT: Focus specifically on the topic: "${topicFilter}". All questions must relate to this topic.`
      : '';

    const prompt = `You are an expert exam setter at Amity University Patna.
Generate a ${diffLabel} institutional quiz for the following subject:

Subject: ${subjectDoc.name}
Subject Code: ${subjectDoc.code}
Semester: ${subjectDoc.semester}
Syllabus Context: ${syllabusContext.substring(0, 2000)}
${moduleContext}${topicContext}

Required:
- ${easyCount} EASY conceptual questions (test basic understanding)
- ${mediumCount} MEDIUM analytical questions (test application)
- ${hardCount} HARD problem-solving questions (test deep understanding)

Each question must have exactly 4 options (A, B, C, D).
Return ONLY valid JSON with this structure:
{
  "easy": [
    { "text": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "correctIndex": 0, "explanation": "Why this is correct..." }
  ],
  "medium": [...],
  "hard": [...]
}`;

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SmartTeach Quiz Engine',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.json();
      throw new Error(err.error?.message || 'AI synthesis engine failed.');
    }

    const aiData = await aiRes.json();
    let rawContent: any;
    try {
      rawContent = JSON.parse(aiData.choices[0].message.content);
    } catch {
      throw new Error('AI returned malformed JSON. Please retry.');
    }

    // 🛡️ Robust Sanitization: Ensure fields are arrays of objects
    const sanitizeLevel = (levelData: any) => {
      if (!levelData) return [];
      const arr = Array.isArray(levelData) ? levelData : (levelData.questions ? levelData.questions : [levelData]);
      return arr.map((q: any) => {
        if (typeof q === 'string') return { text: q, options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: '' };
        return {
          text: q.text || q.question || 'Untitled Question',
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: q.explanation || ''
        };
      });
    };

    const levels = {
      easy:   sanitizeLevel(rawContent.easy || rawContent.levels?.easy),
      medium: sanitizeLevel(rawContent.medium || rawContent.levels?.medium),
      hard:   sanitizeLevel(rawContent.hard || rawContent.levels?.hard),
    };

    const quizTitle = moduleNo 
      ? `${subjectDoc.name} — Unit ${moduleNo}${targetModuleName ? `: ${targetModuleName}` : ''} (Sem ${subjectDoc.semester})`
      : `${subjectDoc.name} — AI Assessment (Sem ${subjectDoc.semester})`;
    const quizDesc = moduleNo
      ? `AI quiz for Unit ${moduleNo}${targetModuleName ? ` (${targetModuleName})` : ''} of ${subjectDoc.name}.${topicFilter ? ` Topic: ${topicFilter}` : ''}`
      : `Auto-generated ${diffLabel} assessment for ${subjectDoc.name}. Code: ${subjectDoc.code}.`;

    if (save) {
      const quiz = await Quiz.create({
        title: quizTitle,
        description: quizDesc,
        departmentId: subjectDoc.departmentId,
        subjectId:    subjectDoc._id,
        semester:     subjectDoc.semester,
        moduleName:   targetModuleName || subjectDoc.name,
        moduleId:     moduleNo ? String(moduleNo) : '1',
        createdBy:    userId,
        levels,
      });
      return NextResponse.json({ success: true, quizId: quiz._id, quiz });
    }

    // Return template only for manual creation flow
    return NextResponse.json({ success: true, levels });

  } catch (error: any) {
    console.error('Quiz Generation Fail:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
