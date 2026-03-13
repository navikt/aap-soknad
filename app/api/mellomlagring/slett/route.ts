import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { slettBucket } from 'lib/api/mellomlagring';

export const DELETE = beskyttetApi(async (req: NextRequest) => {
  await slettBucket(req);
  return NextResponse.json({}, { status: 204 });
});
