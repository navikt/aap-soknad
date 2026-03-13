import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { isMock } from 'utils/environments';
import { getOnBehalfOfToken } from 'lib/utils/api/simpleTokenXProxy';

export const GET = beskyttetApi(async (req: NextRequest) => {
  const uuid = req.nextUrl.searchParams.get('uuid');
  if (!uuid) {
    return NextResponse.json({ error: 'uuid må være en string' }, { status: 400 });
  }

  if (isMock()) {
    return new NextResponse(null, { status: 204 });
  }

  const oboToken = await getOnBehalfOfToken(
    process.env.INNSENDING_AUDIENCE!,
    `${process.env.INNSENDING_URL}/mellomlagring/fil/${uuid}`,
    req,
  );

  const response = await fetch(`${process.env.INNSENDING_URL}/mellomlagring/fil/${uuid}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${oboToken}` },
  });

  const buffer = await response.arrayBuffer();
  return new NextResponse(buffer, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/octet-stream',
    },
  });
});
