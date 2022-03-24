import { BodyLong, BodyShort, GuidePanel, Heading, Ingress } from '@navikt/ds-react';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors } from 'react-hook-form';
import ConfirmationPanelWrapper from '../../components/input/ConfirmationPanelWrapper';
import SoknadStandard from '../../types/SoknadStandard';
import HeadingHelloName from '../../components/async/HeadingHelloName';

interface VeiledningProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
  loading: boolean;
  søkerFulltNavn: string;
}
export const Veiledning = ({
  getText,
  errors,
  control,
  søkerFulltNavn,
  loading,
}: VeiledningProps) => {
  const getParagraphs = (path: string) => {
    const paragraphs = getText(path);
    return Array.isArray(paragraphs) ? paragraphs : [];
  };
  return (
    <>
      <GuidePanel>
        <HeadingHelloName size={'large'} level={'2'} name={søkerFulltNavn} loading={loading} />
        <BodyShort>{getText('steps.veiledning.guide')}</BodyShort>
      </GuidePanel>
      <Heading size="large" level="2">
        {getText(`steps.veiledning.title`)}
      </Heading>
      <Ingress>{getText('steps.veiledning.ingress')}</Ingress>
      <Heading size={'small'} level={'2'}>
        {getText('steps.veiledning.opplysninger.title')}
      </Heading>
      {getParagraphs('steps.veiledning.opplysninger.paragraphs').map((e: string, index: number) => (
        <BodyLong key={`${index}`}>{e}</BodyLong>
      ))}
      <Heading size={'small'} level={'2'}>
        {getText('steps.veiledning.utbetaling.title')}
      </Heading>
      {getParagraphs('steps.veiledning.utbetaling.paragraphs').map((e: string, index: number) => (
        <BodyLong key={`${index}`}>{e}</BodyLong>
      ))}
      <ConfirmationPanelWrapper
        label={getText('steps.veiledning.rettogplikt')}
        control={control}
        name="rettogplikt"
        error={errors?.rettogplikt?.message}
      />
      <ConfirmationPanelWrapper
        label={getText('steps.veiledning.riktigeopplysninger')}
        control={control}
        name="riktigeopplysninger"
        error={errors?.riktigeopplysninger?.message}
      />
    </>
  );
};
