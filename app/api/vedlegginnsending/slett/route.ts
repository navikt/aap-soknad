import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { isMock } from 'utils/environments';
import { getOnBehalfOfToken } from 'lib/utils/api/simpleTokenXProxy';

export const DELETE = beskyttetApi(async (req: NextRequest) => {
  const uuid = req.nextUrl.searchParams.get('uuid');
  if (!uuid || Array.isArray(uuid)) {
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

  await fetch(`${process.env.INNSENDING_URL}/mellomlagring/fil/${uuid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${oboToken}` },
  });

  return new NextResponse(null, { status: 204 });
});
