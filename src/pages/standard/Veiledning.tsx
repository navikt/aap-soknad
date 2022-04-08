import { BodyLong, GuidePanel, Heading, Link, ReadMore } from '@navikt/ds-react';
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
      <article>
        <Heading size={'small'} level={'2'}>
          {getText('steps.veiledning.søknadsdato.title')}
        </Heading>
        {getParagraphs('steps.veiledning.søknadsdato.paragraphs').map(
          (e: string, index: number) => (
            <BodyLong key={`${index}`}>{e}</BodyLong>
          )
        )}
      </article>
      <article>
        <Heading size={'small'} level={'2'}>
          {getText('steps.veiledning.opplysninger.title')}
        </Heading>
        <BodyLong>
          <TextWithLink text={getText('steps.veiledning.opplysninger.text')}>
            <Link target={'_blank'} href={getText('steps.veiledning.opplysninger.link.href')}>
              {getText('steps.veiledning.opplysninger.link.name')}
            </Link>
          </TextWithLink>
        </BodyLong>
      </article>
      <article>
        <Heading size={'small'} level={'2'}>
          {getText('steps.veiledning.rettogplikt.title')}
        </Heading>
        <ReadMore header={getText('steps.veiledning.rettogplikt.readMore.title')}>
          <BodyLong>{getText('steps.veiledning.rettogplikt.readMore.text')}</BodyLong>
        </ReadMore>
      </article>
      <ConfirmationPanelWrapper
        label={getText('steps.veiledning.rettogpliktConfirmation.label')}
        control={control}
        name="rettogplikt"
        error={errors?.rettogplikt?.message}
      >
        <Heading size={'small'} level={'2'}>
          {getText('steps.veiledning.rettogpliktConfirmation.title')}
        </Heading>
        <TextWithLink text={getText('steps.veiledning.rettogpliktConfirmation.description')}>
          <Link
            href={getText('steps.veiledning.rettogpliktConfirmation.link.href')}
            target={'_blank'}
          >
            {getText('steps.veiledning.rettogpliktConfirmation.link.name')}
          </Link>
        </TextWithLink>
      </ConfirmationPanelWrapper>
    </>
  );
};
