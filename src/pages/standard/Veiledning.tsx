import { BodyLong, GuidePanel, Heading, Link } from '@navikt/ds-react';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors } from 'react-hook-form';
import ConfirmationPanelWrapper from '../../components/input/ConfirmationPanelWrapper';
import SoknadStandard from '../../types/SoknadStandard';
import HeadingHelloName from '../../components/async/HeadingHelloName';
import TextWithLink from '../../components/TextWithLink';
import { SøkerView } from '../../context/sokerOppslagContext';

interface VeiledningProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<SoknadStandard>;
  loading: boolean;
  søker: SøkerView;
}
export const Veiledning = ({ getText, errors, control, søker, loading }: VeiledningProps) => {
  const getParagraphs = (path: string) => {
    const paragraphs = getText(path);
    return Array.isArray(paragraphs) ? paragraphs : [];
  };
  return (
    <>
      <GuidePanel>
        <HeadingHelloName size={'large'} level={'2'} name={søker?.fulltNavn} loading={loading} />
        {getParagraphs('steps.veiledning.guide.paragraphs').map((e: string, index: number) => (
          <BodyLong key={`${index}`}>{e}</BodyLong>
        ))}
      </GuidePanel>
      <Heading size="large" level="2">
        {getText(`steps.veiledning.title`)}
      </Heading>
      <Heading size={'small'} level={'2'}>
        {getText('steps.veiledning.søknadsdato.title')}
      </Heading>
      {getParagraphs('steps.veiledning.søknadsdato.paragraphs').map((e: string, index: number) => (
        <BodyLong key={`${index}`}>{e}</BodyLong>
      ))}
      <Heading size={'small'} level={'2'}>
        {getText('steps.veiledning.opplysninger.title')}
      </Heading>
      <TextWithLink text={getText('steps.veiledning.opplysninger.text')}>
        <Link href={'nav.no'}>
          Les om hvordan NAV behandler personopplysninger (åpnes i ny fane)
        </Link>
      </TextWithLink>
      <ConfirmationPanelWrapper
        label={getText('steps.veiledning.rettogplikt.label')}
        control={control}
        name="rettogplikt"
        error={errors?.rettogplikt?.message}
      >
        <TextWithLink text={getText('steps.veiledning.rettogplikt.description')}>
          <Link href={'nav.no'}>rettigheter og plikter</Link>
        </TextWithLink>
      </ConfirmationPanelWrapper>
    </>
  );
};
