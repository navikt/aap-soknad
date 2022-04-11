import { BodyLong, Button, GuidePanel, Heading, Label, ReadMore } from '@navikt/ds-react';
import React, { useEffect } from 'react';
import { GetText } from '../../../hooks/useTexts';
import { useForm } from 'react-hook-form';
import ConfirmationPanelWrapper from '../../../components/input/ConfirmationPanelWrapper';
import HeadingHelloName from '../../../components/async/HeadingHelloName';
import TextWithLink from '../../../components/TextWithLink';
import { SøkerView } from '../../../context/sokerOppslagContext';
import * as classes from '../standard.module.css';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const VEILEDNING_CONFIRM = 'veiledningConfirm';
type VeiledningType = {
  veiledningConfirm?: boolean;
};
const initVeiledning: VeiledningType = {
  veiledningConfirm: false,
};
interface VeiledningProps {
  getText: GetText;
  loading: boolean;
  søker: SøkerView;
  onSubmit: () => void;
}
export const Veiledning = ({ getText, søker, loading, onSubmit }: VeiledningProps) => {
  const getParagraphs = (path: string) => {
    const paragraphs = getText(path);
    return Array.isArray(paragraphs) ? paragraphs : [];
  };
  const schema = yup.object().shape({
    veiledningConfirm: yup.boolean().required('Du må bekrefte').oneOf([true], 'Du må bekrefte'),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VeiledningType>({
    resolver: yupResolver(schema),
    defaultValues: { ...initVeiledning },
  });
  useEffect(() => console.log('errors ', errors), [errors]);
  const veiledningHandleSubmit = (data: any) => {
    console.log('veiledning ok', data);
    onSubmit();
  };
  return (
    <>
      <Heading size="large" level="2">
        {getText(`steps.veiledning.title`)}
      </Heading>
      <GuidePanel>
        <HeadingHelloName size={'large'} level={'2'} name={søker?.fulltNavn} loading={loading} />
        {getParagraphs('steps.veiledning.guide.paragraphs').map((e: string, index: number) => (
          <BodyLong key={`${index}`}>{e}</BodyLong>
        ))}
      </GuidePanel>
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
          <TextWithLink
            text={getText('steps.veiledning.opplysninger.text')}
            links={[getText('steps.veiledning.opplysninger.link')]}
          />
        </BodyLong>
      </article>
      <article>
        <Heading size={'small'} level={'2'}>
          {getText('steps.veiledning.rettogplikt.title')}
        </Heading>
        <ReadMore header={getText('steps.veiledning.rettogplikt.readMore.title')}>
          {getText('steps.veiledning.rettogplikt.readMore.text')}
          <ul>
            <li>{getText('steps.veiledning.rettogplikt.readMore.bullet1')}</li>
            <li>
              <TextWithLink
                text={getText('steps.veiledning.rettogplikt.readMore.bullet2')}
                links={[getText('steps.veiledning.rettogplikt.readMore.bullet2Link')]}
              />
            </li>
            <li>
              <TextWithLink
                text={getText('steps.veiledning.rettogplikt.readMore.bullet3')}
                links={[getText('steps.veiledning.rettogplikt.readMore.bullet3Link')]}
              />
            </li>
            <li>
              <TextWithLink
                text={getText('steps.veiledning.rettogplikt.readMore.bullet4')}
                links={[getText('steps.veiledning.rettogplikt.readMore.bullet4Link')]}
              />
            </li>
          </ul>
        </ReadMore>
      </article>
      <form
        onSubmit={handleSubmit(veiledningHandleSubmit)}
        className={classes?.soknadForm}
        autoComplete="off"
      >
        <ConfirmationPanelWrapper
          label={getText('steps.veiledning.rettogpliktConfirmation.label')}
          control={control}
          name={VEILEDNING_CONFIRM}
          error={errors?.[VEILEDNING_CONFIRM]?.message}
        >
          <Label>{getText('steps.veiledning.rettogpliktConfirmation.title')}</Label>
          <TextWithLink
            text={getText('steps.veiledning.rettogpliktConfirmation.description')}
            links={[getText('steps.veiledning.rettogpliktConfirmation.link')]}
          />
        </ConfirmationPanelWrapper>
        <div className={classes?.buttonWrapper}>
          <Button variant="primary" type="submit">
            {getText(`steps.veiledning.buttonText`)}
          </Button>
          <Button variant="tertiary" type="button" onClick={() => console.log('TODO')}>
            {getText('cancelButtonText')}
          </Button>
        </div>
      </form>
    </>
  );
};
