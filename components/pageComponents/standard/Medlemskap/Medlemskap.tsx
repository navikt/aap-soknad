import { BodyShort, Button, HGrid, Heading, Radio, RadioGroup, ReadMore } from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { JaEllerNei } from 'types/Generic';
import { Add } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger from '..//UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { validate } from 'lib/utils/validationUtils';
import { Soknad, UtenlandsPeriode } from 'types/Soknad';
import { completeAndGoToNextStep } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { useIntl } from 'react-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { logSkjemastegFullførtEvent } from 'utils/amplitude';
import { SøknadValidationError } from 'components/schema/FormErrorSummary';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { v4 as uuid4 } from 'uuid';
import { getMedlemskapSchema } from './medlemskapSchema';
import {
  utenlandsPeriodeArbeidEllerBodd,
  validateArbeidINorge,
  validateArbeidUtenforNorgeFørSykdom,
  validateOgsåArbeidetUtenforNorge,
  validateUtenlandsPeriode,
} from './medlemskapUtils';
import { useSoknad } from 'hooks/SoknadHook';
import { updateSøknadData } from 'context/soknadcontext/actions';
import { UtenlandsOppholdListe } from 'components/pageComponents/standard/Medlemskap/UtenlandsOppholdListe';

interface Props {
  onBackClick: () => void;
}

export const Medlemskap = ({ onBackClick }: Props) => {
  const { formatMessage } = useIntl();

  const { currentStepIndex, stepWizardDispatch, stepList } = useStepWizard();
  const { søknadState, søknadDispatch } = useSoknad();
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const [selectedUtenlandsPeriode, setSelectedUtenlandsPeriode] = useState<UtenlandsPeriode>({});
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.medlemskap]);

  const append = (utenlandsPeriode: UtenlandsPeriode) => {
    const newList = [
      ...(søknadState?.søknad?.medlemskap?.utenlandsOpphold || []),
      {
        ...utenlandsPeriode,
      },
    ];
    newList.sort((periodeA, periodeB) => {
      const a = periodeA.tilDato as any;
      const b = periodeB.fraDato as any;
      return b - a;
    });
    updateSøknadData(søknadDispatch, {
      medlemskap: {
        ...søknadState?.søknad?.medlemskap,
        utenlandsOpphold: newList,
      },
    });
  };

  const update = (updatedUtenlandsPeriode: UtenlandsPeriode) => {
    updateSøknadData(søknadDispatch, {
      medlemskap: {
        ...søknadState?.søknad?.medlemskap,
        utenlandsOpphold: søknadState.søknad?.medlemskap?.utenlandsOpphold?.map(
          (utenlandsPeriode) =>
            utenlandsPeriode.id === updatedUtenlandsPeriode.id
              ? updatedUtenlandsPeriode
              : utenlandsPeriode,
        ),
      },
    });
  };

  const visArbeidINorge = validateArbeidINorge(
    søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
  );

  const visArbeidUtenforNorgeFørSykdom = validateArbeidUtenforNorgeFørSykdom(
    søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
  );

  const visOgsåArbeidetUtenforNorge = validateOgsåArbeidetUtenforNorge(
    søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
    søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År,
  );

  const visLeggTilUtenlandsPeriode = validateUtenlandsPeriode(søknadState.søknad?.medlemskap);

  const arbeidEllerBodd = utenlandsPeriodeArbeidEllerBodd(søknadState?.søknad?.medlemskap);

  function clearErrors() {
    setErrors(undefined);
  }

  const findError = (path: string) => errors?.find((error) => error.path === path)?.message;
  const utenlandsOppholdErrorMessage = findError('medlemskap.utenlandsOpphold');

  return (
    <>
      <SoknadFormWrapperNew
        onNext={async () => {
          const errors = await validate(getMedlemskapSchema(formatMessage), søknadState.søknad);
          if (errors) {
            setErrors(errors);
            setFocusOnErrorSummary();
            return;
          }

          logSkjemastegFullførtEvent(currentStepIndex ?? 0);
          completeAndGoToNextStep(stepWizardDispatch);
        }}
        onBack={() => {
          updateSøknadData(søknadDispatch, { ...søknadState.søknad });
          onBackClick();
        }}
        errors={errors}
      >
        <Heading size="large" level="2">
          {formatMessage({ id: 'søknad.medlemskap.title' })}
        </Heading>
        <LucaGuidePanel>{formatMessage({ id: 'søknad.medlemskap.guide.text' })}</LucaGuidePanel>
        <RadioGroup
          name={`medlemskap.harBoddINorgeSiste5År`}
          id={`medlemskap.harBoddINorgeSiste5År`}
          legend={formatMessage({ id: 'søknad.medlemskap.harBoddINorgeSiste5År.label' })}
          value={søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År || ''}
          onChange={(value) => {
            clearErrors();
            updateSøknadData(søknadDispatch, { medlemskap: { harBoddINorgeSiste5År: value } });
          }}
          error={findError('medlemskap.harBoddINorgeSiste5År')}
        >
          <ReadMore
            header={formatMessage({ id: 'søknad.medlemskap.harBoddINorgeSiste5År.readMore.title' })}
            type={'button'}
          >
            {formatMessage({ id: 'søknad.medlemskap.harBoddINorgeSiste5År.readMore.text' })}
          </ReadMore>
          <Radio value={JaEllerNei.JA}>
            <BodyShort>Ja</BodyShort>
          </Radio>
          <Radio value={JaEllerNei.NEI}>
            <BodyShort>Nei</BodyShort>
          </Radio>
        </RadioGroup>
        {visArbeidINorge && (
          <>
            <RadioGroup
              name={'medlemskap.harArbeidetINorgeSiste5År'}
              id={'medlemskap.harArbeidetINorgeSiste5År'}
              legend={formatMessage({ id: 'søknad.medlemskap.harArbeidetINorgeSiste5År.label' })}
              value={søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År || ''}
              onChange={(value) => {
                clearErrors();
                updateSøknadData(søknadDispatch, {
                  medlemskap: {
                    harBoddINorgeSiste5År: søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
                    harArbeidetINorgeSiste5År: value,
                  },
                });
              }}
              error={findError('medlemskap.harArbeidetINorgeSiste5År')}
            >
              <ReadMore
                header={formatMessage({
                  id: 'søknad.medlemskap.harArbeidetINorgeSiste5År.readMore.title',
                })}
                type={'button'}
              >
                {formatMessage({ id: 'søknad.medlemskap.harArbeidetINorgeSiste5År.readMore.text' })}
              </ReadMore>
              <Radio value={JaEllerNei.JA}>
                <BodyShort>Ja</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>Nei</BodyShort>
              </Radio>
            </RadioGroup>
          </>
        )}
        {visArbeidUtenforNorgeFørSykdom && (
          // Gjelder §11-19 og beregning av utbetaling. Skal kun komme opp hvis §11-2 er oppfyltt
          <>
            <RadioGroup
              name={'medlemskap.arbeidetUtenforNorgeFørSykdom'}
              id={'medlemskap.arbeidetUtenforNorgeFørSykdom'}
              legend={formatMessage({ id: 'søknad.medlemskap.arbeidUtenforNorge.label' })}
              value={søknadState?.søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom || ''}
              onChange={(value) => {
                clearErrors();
                updateSøknadData(søknadDispatch, {
                  medlemskap: {
                    harBoddINorgeSiste5År: søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
                    arbeidetUtenforNorgeFørSykdom: value,
                  },
                });
              }}
              error={findError('medlemskap.arbeidetUtenforNorgeFørSykdom')}
            >
              <ReadMore
                header={formatMessage({
                  id: 'søknad.medlemskap.arbeidUtenforNorge.readMore.title',
                })}
                type={'button'}
              >
                {formatMessage({ id: 'søknad.medlemskap.arbeidUtenforNorge.readMore.text' })}
              </ReadMore>
              <Radio value={JaEllerNei.JA}>
                <BodyShort>Ja</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>Nei</BodyShort>
              </Radio>
            </RadioGroup>
          </>
        )}
        {visOgsåArbeidetUtenforNorge && (
          <>
            <RadioGroup
              name={'medlemskap.iTilleggArbeidUtenforNorge'}
              id={'medlemskap.iTilleggArbeidUtenforNorge'}
              legend={formatMessage({ id: 'søknad.medlemskap.iTilleggArbeidUtenforNorge.label' })}
              description={formatMessage({
                id: 'søknad.medlemskap.iTilleggArbeidUtenforNorge.description',
              })}
              value={søknadState?.søknad?.medlemskap?.iTilleggArbeidUtenforNorge || ''}
              onChange={(value) => {
                clearErrors();
                updateSøknadData(søknadDispatch, {
                  medlemskap: {
                    harBoddINorgeSiste5År: søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
                    harArbeidetINorgeSiste5År:
                      søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År,
                    iTilleggArbeidUtenforNorge: value,
                  },
                });
              }}
              error={findError('medlemskap.iTilleggArbeidUtenforNorge')}
            >
              <ReadMore
                header={formatMessage({
                  id: 'søknad.medlemskap.iTilleggArbeidUtenforNorge.readMore.title',
                })}
                type={'button'}
              >
                {formatMessage({
                  id: 'søknad.medlemskap.iTilleggArbeidUtenforNorge.readMore.text',
                })}
              </ReadMore>
              <Radio value={JaEllerNei.JA}>
                <BodyShort>Ja</BodyShort>
              </Radio>
              <Radio value={JaEllerNei.NEI}>
                <BodyShort>Nei</BodyShort>
              </Radio>
            </RadioGroup>
          </>
        )}
        {visLeggTilUtenlandsPeriode && (
          <ColorPanel color={'grey'}>
            <BodyShort spacing>
              {formatMessage({
                id: `søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}`,
              })}
            </BodyShort>
            {arbeidEllerBodd === 'BODD' && (
              <BodyShort spacing>
                {formatMessage({
                  id: `søknad.medlemskap.utenlandsperiode.modal.ingress.${arbeidEllerBodd}_2`,
                })}
              </BodyShort>
            )}
            {søknadState?.søknad?.medlemskap?.utenlandsOpphold &&
              søknadState?.søknad.medlemskap.utenlandsOpphold.length > 0 && (
                <UtenlandsOppholdListe
                  utenlandsPerioder={søknadState?.søknad?.medlemskap.utenlandsOpphold}
                  setSelectedUtenlandsPeriode={setSelectedUtenlandsPeriode}
                  setShowUtenlandsPeriodeModal={setShowUtenlandsPeriodeModal}
                  arbeidEllerBodd={arbeidEllerBodd}
                />
              )}
            <HGrid columns={{ xs: 1, md: 2 }}>
              <Button
                id="medlemskap.utenlandsOpphold"
                variant="secondary"
                type="button"
                icon={<Add title={'Legg til'} />}
                iconPosition={'left'}
                onClick={() => {
                  setSelectedUtenlandsPeriode({});
                  setShowUtenlandsPeriodeModal(true);
                }}
              >
                {søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År === JaEllerNei.NEI
                  ? 'Registrer utenlandsopphold'
                  : 'Registrer periode med jobb utenfor Norge'}
              </Button>
            </HGrid>

            {utenlandsOppholdErrorMessage && (
              <div className={'navds-error-message navds-error-message--medium navds-label'}>
                {utenlandsOppholdErrorMessage}
              </div>
            )}
          </ColorPanel>
        )}
      </SoknadFormWrapperNew>
      <UtenlandsPeriodeVelger
        utenlandsPeriode={selectedUtenlandsPeriode}
        setUtenlandsPeriode={setSelectedUtenlandsPeriode}
        isOpen={showUtenlandsPeriodeModal}
        arbeidEllerBodd={arbeidEllerBodd}
        closeModal={() => {
          setShowUtenlandsPeriodeModal(false);
          setSelectedUtenlandsPeriode({});
        }}
        onSave={(utenlandsperiode) => {
          if (selectedUtenlandsPeriode.id === undefined) {
            append({ ...utenlandsperiode, id: uuid4() });
            clearErrors();
          } else {
            update(utenlandsperiode);
          }
        }}
      />
    </>
  );
};
