import {
  Accordion,
  BodyLong,
  BodyShort,
  Button,
  GuidePanel,
  Heading,
  Label,
} from '@navikt/ds-react';
import React, { useMemo } from 'react';
import { getParagraphs, GetText } from '../../../hooks/useTexts';
import { useForm } from 'react-hook-form';
import ConfirmationPanelWrapper from '../../../components/input/ConfirmationPanelWrapper';
import HeadingHelloName from '../../../components/async/HeadingHelloName';
import { SøkerView } from '../../../context/sokerOppslagContext';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as classes from './Veiledning.module.css';

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
  return (
    <>
      <header className={classes?.veiledningHeader}>
        <Heading size="large" level="1">
          {getText(`steps.veiledning.title`)}
        </Heading>
      </header>
      <main className={classes?.veiledningContent}>
        <GuidePanel>
          <HeadingHelloName size={'medium'} level={'2'} name={søker?.fulltNavn} loading={loading} />
          {getParagraphs('steps.veiledning.guide.paragraphs', getText).map(
            (e: string, index: number) => (
              <BodyShort key={`${index}`} spacing>
                {e}
              </BodyShort>
            )
          )}
        </GuidePanel>
        <article>
          <Heading size={'small'} level={'2'} spacing>
            {getText('steps.veiledning.søknadsdato.title')}
          </Heading>
          {getParagraphs('steps.veiledning.søknadsdato.paragraphs', getText).map(
            (e: string, index: number) => (
              <BodyShort key={`${index}`} spacing>
                {e}
              </BodyShort>
            )
          )}
        </article>
        <article>
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Hvis du får AAP gjelder dette</Accordion.Header>
              <Accordion.Content>
                <BodyShort spacing>
                  <ul>
                    <li>Du har rett til oppfølging fra NAV</li>
                    <li>
                      Du har plikt til å bidra til å avklare om du kan beholde eller komme i jobb
                    </li>
                    <li>Du må sende inn meldekort hver 14. dag</li>
                    <li>Du har plikt til å gi beskjed hvis situasjonen din endrer seg</li>
                  </ul>
                </BodyShort>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Vi vil hente informasjon om deg</Accordion.Header>
              <Accordion.Content>
                <BodyLong spacing>
                  I tillegg til den informasjonen du oppgir i søknaden, henter vi:
                  <ul>
                    <li>personinformasjon om deg og barna dine</li>
                    <li>inntektsinformasjon fra Skatteetaten</li>
                    <li>helseinformasjon fra lege/behandler for å kartlegge arbeidsevnen din</li>
                    <li>opplysninger om arbeidsforholdet ditt fra Aa-registeret</li>
                  </ul>
                </BodyLong>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </article>

        <form
          onSubmit={handleSubmit(() => onSubmit())}
          className={classes?.veiledningContent}
          autoComplete="off"
        >
          <ConfirmationPanelWrapper
            label={getText('steps.veiledning.rettogpliktConfirmation.label')}
            control={control}
            name={VEILEDNING_CONFIRM}
            error={errors?.[VEILEDNING_CONFIRM]?.message}
          >
            <Label>{getText('steps.veiledning.rettogpliktConfirmation.title')}</Label>
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
      </main>
    </>
  );
};
