import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Syllabus from '@/models/Syllabus';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'faculty'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { subjectId, duration } = await req.json();

    if (!subjectId) return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });

    await dbConnect();

    const subjectDoc = await Subject.findById(subjectId).lean() as any;
    if (!subjectDoc) return NextResponse.json({ error: 'Subject not found.' }, { status: 404 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API Key not configured.' }, { status: 500 });

    // Try to get syllabus context
    const structuredSyllabus = await Syllabus.findOne({ subjectId }).lean() as any;
    const syllabusText = structuredSyllabus ? `Context: ${structuredSyllabus.courseDescription}` : subjectDoc.syllabus || '';

    const prompt = `You are an expert curriculum designer at Amity University.
Subject: "${subjectDoc.name}" (${subjectDoc.code})
Syllabus Content: 
${syllabusText}

Task: Based on the syllabus above, partition this subject into 5 strategic UNITS (Modules) for a 15-week semester.
Each module should logically group related topics and be appropriately timed.

Return ONLY a valid JSON:
{
  "modules": [
    { 
      "moduleNo": 1, 
      "title": "Unit Title (e.g. Fundamental Concepts)", 
      "summary": "Precise summary of topics covered in this unit...", 
      "duration": "3 Weeks" 
    },
    ... exactly 5 modules
  ]
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SmartTeach Shell Generator',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error('Shell generation failed');

    const aiResult = await response.json();
    let shell: any;
    try {
      shell = JSON.parse(aiResult.choices[0].message.content);
    } catch {
      throw new Error('AI returned invalid module format.');
    }

    return NextResponse.json(shell);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
