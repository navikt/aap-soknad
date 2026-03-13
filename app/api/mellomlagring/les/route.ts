import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { hentMellomlagring } from 'lib/api/mellomlagring';

export const GET = beskyttetApi(async (req: NextRequest) => {
  const result = await hentMellomlagring(req);
  return NextResponse.json(result ?? null, { status: 200 });
});
