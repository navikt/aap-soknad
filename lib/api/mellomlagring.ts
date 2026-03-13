import { logError, logInfo } from '@navikt/aap-felles-utils';
import { lesCache, lagreCache, deleteCache } from 'mock/mellomlagringsCache';
import { isFunctionalTest, isMock } from 'utils/environments';
import { defaultStepList } from 'lib/defaultStepList';
import { SOKNAD_VERSION, SoknadContextState } from 'context/soknadcontext/soknadContextTypes';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { IncomingMessage } from 'http';
import { NextRequest } from 'next/server';
import { ErrorMedStatus } from 'lib/utils/api/ErrorMedStatus';

type SupportedRequest = IncomingMessage | NextRequest | Request;

export const hentMellomlagring = async (
  req?: SupportedRequest,
): Promise<SoknadContextState | undefined> => {
  if (isFunctionalTest()) {
    return {
      version: SOKNAD_VERSION,
      søknad: {},
      lagretStepList: defaultStepList,
      requiredVedlegg: [],
    };
  }
  if (isMock()) {
    const result = await lesCache();
    return result ? JSON.parse(result) : undefined;
  }
  try {
    const mellomlagretSøknad = await simpleTokenXProxy<SoknadContextState | string>({
      url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
      method: 'GET',
      audience: process.env.INNSENDING_AUDIENCE!,
      req,
    });
    if (typeof mellomlagretSøknad === 'string') {
      logInfo('Mellomlagret søknad er en string??, parser til Json før den returneres');
      return JSON.parse(mellomlagretSøknad);
    }
    logInfo('Mellomlagret søknad hentet fra aap-innsending', mellomlagretSøknad);
    return mellomlagretSøknad;
  } catch (error: any) {
    if (error instanceof ErrorMedStatus) {
      if (error.status === 204) {
        logInfo('Ingen mellomlagring funnet i aap-innsending');
        return undefined;
      }
    }
    logError('Noe gikk galt i henting av mellomlagring fra aap-innsending', error);
    return undefined;
  }
};

export const mellomlagreSøknad = async (data: object, req: SupportedRequest) => {
  if (isFunctionalTest()) return;
  if (isMock()) return await lagreCache(JSON.stringify(data));
  try {
    const result = await simpleTokenXProxy({
      url: `${process.env.INNSENDING_URL}/mellomlagring/søknad/v2`,
      method: 'POST',
      audience: process.env.INNSENDING_AUDIENCE!,
      body: data,
      req,
    });
    logInfo('Søknad lagret via aap-innsending', result);
    return result;
  } catch (error) {
    logError('Noe gikk galt ved mellomlagring av søknad', error);
    throw new Error('Error saving søknad via aap-innsending');
  }
};

export const slettBucket = async (req: SupportedRequest) => {
  if (isMock()) {
    await deleteCache();
    return;
  }

  try {
    const result = await simpleTokenXProxy({
      url: `${process.env.INNSENDING_URL}/mellomlagring/søknad`,
      method: 'DELETE',
      audience: process.env.INNSENDING_AUDIENCE!,
      req,
    });
    logInfo('Søknad slettet via aap-innsending', result);
    return result;
  } catch (error) {
    logError('Noe gikk galt ved sletting av søknad', error);
    throw new Error('Error deleting søknad via aap-innsending');
  }
};
