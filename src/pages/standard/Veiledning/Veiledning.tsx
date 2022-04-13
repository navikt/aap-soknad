import {
  BodyLong,
  Button,
  Cell,
  Grid,
  GuidePanel,
  Heading,
  Label,
  ReadMore,
} from '@navikt/ds-react';
import React, { useMemo } from 'react';
import { getParagraphs, GetText } from '../../../hooks/useTexts';
import { useForm } from 'react-hook-form';
import ConfirmationPanelWrapper from '../../../components/input/ConfirmationPanelWrapper';
import HeadingHelloName from '../../../components/async/HeadingHelloName';
import TextWithLink from '../../../components/TextWithLink';
import { SøkerView } from '../../../context/sokerOppslagContext';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './Veiledning.module.css';
import { FormErrorSummary } from '../../../components/schema/FormErrorSummary';

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
  const schema = useMemo(
    () =>
      yup.object().shape({
        veiledningConfirm: yup
          .boolean()
          .required(getText('form.veiledningConfirm.required'))
          .oneOf([true], getText('form.veiledningConfirm.required')),
      }),
    [getText]
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VeiledningType>({
    resolver: yupResolver(schema),
    defaultValues: { ...initVeiledning },
  });
  const veiledningHandleSubmit = (data: any) => {
    console.log('veiledning ok', data);
    onSubmit();
  };
  return (
    <div className={classes?.veiledningContent}>
      <Heading size="large" level="1">
        {getText(`steps.veiledning.title`)}
      </Heading>
      <GuidePanel>
        <HeadingHelloName size={'large'} level={'2'} name={søker?.fulltNavn} loading={loading} />
        {getParagraphs('steps.veiledning.guide.paragraphs', getText).map(
          (e: string, index: number) => (
            <BodyLong key={`${index}`}>{e}</BodyLong>
          )
        )}
      </GuidePanel>
      <article>
        <Heading size={'small'} level={'2'}>
          {getText('steps.veiledning.søknadsdato.title')}
        </Heading>
        {getParagraphs('steps.veiledning.søknadsdato.paragraphs', getText).map(
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
        className={classes?.veiledningContent}
        autoComplete="off"
      >
        <FormErrorSummary errors={errors} />
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
        <Grid>
          <Cell xs={3}>
            <Button variant="primary" type="submit">
              {getText(`steps.veiledning.buttonText`)}
            </Button>
          </Cell>
          <Cell xs={3}>
            <Button variant="tertiary" type="button" onClick={() => console.log('TODO')}>
              {getText('cancelButtonText')}
            </Button>
          </Cell>
        </Grid>
      </form>
    </div>
  );
};
