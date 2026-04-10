import { NextResponse } from 'next/server';
import { seedInstitutionalData } from '@/lib/seed';

export async function GET() {
  try {
    const result = await seedInstitutionalData();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
