import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'faculty'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { studentName, scores, totalScore, maxTotalScore } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey.includes('YOUR_OPENROUTER_KEY')) {
      return NextResponse.json({ error: 'OpenRouter API Key not configured' }, { status: 500 });
    }

    const scoresList = scores.map((s: any) => `- ${s.criterionName}: ${s.score}`).join('\n');
    const prompt = `Act as an expert academic educator. Provide personalized, constructive feedback for a student based on their assessment marks.
    
Student Name: ${studentName}
Total Score: ${totalScore} / ${maxTotalScore}
Criteria Breakdown:
${scoresList}

The feedback should be:
1. Professional yet encouraging.
2. Highlight strengths based on high scores.
3. Suggest specific areas for improvement based on lower scores.
4. Keep it concise (3-4 sentences).

Return ONLY the feedback text.`;

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
      const err = await response.json();
      throw new Error(err.error?.message || "AI Feedback Generation failed");
    }

    const aiResult = await response.json();
    const feedback = aiResult.choices[0].message.content.trim();

    return NextResponse.json({ feedback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
