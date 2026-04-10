import { NextRequest, NextResponse } from 'next/server';

// pdf-parse is a CJS-only module; must be imported with require in ESM context
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No syllabus document provided.' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    const text: string = result.text || '';

    return NextResponse.json({
      success: true,
      text: text.substring(0, 6000),
      stats: {
        pages: result.numpages,
        words: text.trim().split(/\s+/).length,
      },
    });
  } catch (error: any) {
    console.error('PDF Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to process syllabus PDF. Ensure it is a text-based (non-scanned) PDF.' },
      { status: 500 }
    );
  }
}
