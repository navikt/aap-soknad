import { NextRequest, NextResponse } from 'next/server';
import { register } from 'prom-client';

export async function GET(_req: NextRequest) {
  return new Response(await register.metrics(), {
    headers: { 'Content-Type': register.contentType },
  });
}
