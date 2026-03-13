import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { isMock } from 'utils/environments';
import { randomUUID } from 'crypto';
import { getOnBehalfOfToken } from 'lib/utils/api/simpleTokenXProxy';

export const POST = beskyttetApi(async (req: NextRequest) => {
  if (isMock()) {
    return NextResponse.json({ filId: randomUUID() }, { status: 201 });
  }

  const oboToken = await getOnBehalfOfToken(
    process.env.INNSENDING_AUDIENCE!,
    `${process.env.INNSENDING_URL}/mellomlagring/fil`,
    req,
  );

  const body = await req.arrayBuffer();
  const contentType = req.headers.get('content-type') ?? 'application/octet-stream';

  const response = await fetch(`${process.env.INNSENDING_URL}/mellomlagring/fil`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${oboToken}`,
      'Content-Type': contentType,
    },
    body,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
});
