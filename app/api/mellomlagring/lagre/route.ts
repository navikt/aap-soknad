import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { mellomlagreSøknad, hentMellomlagring } from 'lib/api/mellomlagring';
import { logError } from '@navikt/aap-felles-utils';
import { StepType } from 'components/StepWizard/Step';

export const POST = beskyttetApi(async (req: NextRequest) => {
  const body = await req.json();
  const eksisterendeSøknad = await hentMellomlagring(req);

  if (
    eksisterendeSøknad &&
    eksisterendeSøknad.søknad &&
    Object.keys(eksisterendeSøknad.søknad).length > 0 &&
    Object.keys(body.søknad).length === 0
  ) {
    const activeStepIndex = eksisterendeSøknad?.lagretStepList?.find(
      (e: StepType) => e.active,
    )?.stepIndex;
    logError(
      `Overskriver eksisterende søknad med en tom søknad på side ${activeStepIndex ?? 'ukjent'}`,
    );
  }

  await mellomlagreSøknad(body, req);
  return NextResponse.json({}, { status: 201 });
});
