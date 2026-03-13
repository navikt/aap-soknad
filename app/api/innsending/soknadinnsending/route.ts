import { beskyttetApi } from 'auth/beskyttetApi';
import { logError } from '@navikt/aap-felles-utils';
import { NextRequest, NextResponse } from 'next/server';
import metrics from 'utils/metrics';
import { ErrorMedStatus } from 'lib/utils/api/ErrorMedStatus';
import { isFunctionalTest, isMock } from 'utils/environments';
import { getTranslations } from 'next-intl/server';
import linksJson from 'translations/links.json';
import { ManueltOppgittBarn, Soknad } from 'types/Soknad';
import { mapSøknadToPdf } from 'utils/api';
import { getAndreUtbetalingerSchema } from 'components/pageComponents/standard/AndreUtbetalinger/andreUtbetalinger.schema';
import { getBehandlerSchema } from 'components/pageComponents/standard/Behandlere/behandler.schema';
import { getMedlemskapSchema } from 'components/pageComponents/standard/Medlemskap/medlemskapSchema';
import { getStartDatoSchema } from 'components/pageComponents/standard/StartDato/startDato.schema';
import { getStudentSchema } from 'components/pageComponents/standard/Student/student.schema';
import { getYrkesskadeSchema } from 'components/pageComponents/standard/Yrkesskade/yrkesskade.schema';
import { AttachmentType, RequiredVedlegg } from 'types/SoknadContext';
import { SOKNAD_VERSION } from 'context/soknadcontext/soknadContextTypes';
import { deleteCache } from 'mock/mellomlagringsCache';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { søknadVedleggStateTilFilArray } from 'utils/vedlegg';
import { formatNavn } from 'utils/StringFormatters';
import { IncomingMessage } from 'http';

interface SoknadInnsending extends Soknad {
  version: number;
  etterspurtDokumentasjon: AttachmentType[];
}

interface SoknadInnsendingRequestBody {
  kvittering?: Record<string, unknown>;
  soknad: SoknadInnsending;
  filer: Array<Fil>;
}

interface Fil {
  id: string;
  tittel: string;
}

const søknadIsValid = async (søknad: Soknad) => {
  const t = await getTranslations({ locale: 'nb' });
  const formatMessage = (id: string, values?: Record<string, any>) => t(id, values);

  const validationResults = [
    getStartDatoSchema(formatMessage).isValidSync({
      sykepenger: søknad.sykepenger,
      ferie: søknad.ferie,
    }),
    getMedlemskapSchema(formatMessage).isValidSync(søknad),
    getYrkesskadeSchema(formatMessage).isValidSync(søknad),
    getStudentSchema(formatMessage).isValidSync(søknad.student),
    getAndreUtbetalingerSchema(formatMessage).isValidSync(søknad.andreUtbetalinger),
  ];

  if (søknad.andreBehandlere) {
    søknad.andreBehandlere.forEach((behandler) => {
      validationResults.push(getBehandlerSchema(formatMessage).isValidSync(behandler));
    });
  }

  return validationResults.filter((result) => !result).length === 0;
};

export const sendSoknadViaAapInnsending = async (
  innsending: SoknadInnsendingRequestBody,
  req: IncomingMessage | Request | NextRequest,
) => {
  if (isFunctionalTest()) {
    return 'Vi har mottat søknaden din.';
  }
  if (isMock()) {
    try {
      await deleteCache();
    } catch (e) {
      console.error(e);
    }
    return 'Vi har mottat søknaden din.';
  }
  try {
    const søknad = await simpleTokenXProxy({
      url: `${process.env.INNSENDING_URL}/innsending`,
      audience: process.env.INNSENDING_AUDIENCE!,
      method: 'POST',
      body: innsending,
      req,
    });
    return søknad;
  } catch (error) {
    logError('Noe gikk galt ved innsending av søknad', error);
    if (error instanceof ErrorMedStatus) {
      throw error;
    }
    throw new Error('Error sending søknad via aap-innsending');
  }
};

export const POST = beskyttetApi(async (req: NextRequest) => {
  const { søknad, requiredVedlegg } = (await req.json()) as {
    søknad: Soknad;
    requiredVedlegg: RequiredVedlegg[];
  };
  const filer: Fil[] = søknadVedleggStateTilFilArray(søknad);
  const etterspurtDokumentasjon = requiredVedlegg?.map((vedlegg) => vedlegg.type);

  if (!(await søknadIsValid(søknad))) {
    return NextResponse.json({ errorMessage: 'Søknaden er ikke gyldig' }, { status: 400 });
  }

  const t = await getTranslations({ locale: 'nb' });
  const formatMessage = (id: string, values?: Record<string, any>) => t(id, values);
  const søknadPdf = mapSøknadToPdf(søknad, new Date(), formatMessage, []);

  try {
    await sendSoknadViaAapInnsending(
      {
        soknad: {
          ...søknad,
          version: SOKNAD_VERSION,
          etterspurtDokumentasjon,
          ...(!!søknad.manuelleBarn?.length && {
            oppgitteBarn: {
              identer: søknad.manuelleBarn
                .filter((barn) => barn.fnr)
                .map((barn) => ({ identifikator: barn.fnr })),
              barn: søknad.manuelleBarn.map(
                (barn) =>
                  ({
                    navn: formatNavn(barn.navn),
                    fødselsdato: barn.fødseldato,
                    ident: barn.fnr ? { identifikator: barn.fnr } : undefined,
                    relasjon: barn.relasjon,
                  }) as ManueltOppgittBarn,
              ),
            },
          }),
        },
        kvittering: søknadPdf,
        filer,
      },
      req,
    );

    metrics.sendSoknadCounter.inc({ type: 'STANDARD' });
    return new NextResponse('Vi har mottat søknaden', { status: 201 });
  } catch (err) {
    logError(`Noe gikk galt ved innsending av søknad`, err);
    if (err instanceof ErrorMedStatus) {
      return NextResponse.json({ navCallId: err.navCallId }, { status: err.status });
    } else {
      throw err;
    }
  }
});
