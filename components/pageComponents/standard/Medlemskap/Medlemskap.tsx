import {
  BodyShort,
  Button,
  Cell,
  Grid,
  Heading,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react';
import React, { useEffect, useState } from 'react';
import { JaEllerNei } from 'types/Generic';
import { Add } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger, {
  ArbeidEllerBodd,
} from '..//UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { validate } from 'lib/utils/validationUtils';
import { Medlemskap as MedlemskapType, Soknad, UtenlandsPeriode } from 'types/Soknad';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import * as yup from 'yup';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { IntlFormatters, useIntl } from 'react-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapperNew';
import { logSkjemastegFullførtEvent } from 'utils/amplitude';
import { SøknadValidationError } from 'components/schema/FormErrorSummaryNew';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { updateSøknadData } from 'context/soknadContextCommon';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { v4 as uuid4 } from 'uuid';
import UtenlandsOppholdTabell from './UtenlandsOppholdTabell';

interface Props {
  onBackClick: () => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

const validateArbeidINorge = (boddINorge?: JaEllerNei | null) => boddINorge === JaEllerNei.NEI;
const validateArbeidUtenforNorgeFørSykdom = (boddINorge?: JaEllerNei | null) =>
  boddINorge === JaEllerNei.JA;
const valideOgsåArbeidetUtenforNorge = (boddINorge?: JaEllerNei | null, JobbINorge?: JaEllerNei) =>
  boddINorge === JaEllerNei.NEI && JobbINorge === JaEllerNei.JA;
const validateUtenlandsPeriode = (medlemskap?: MedlemskapType) => {
  return (
    medlemskap?.arbeidetUtenforNorgeFørSykdom === JaEllerNei.JA ||
    medlemskap?.harArbeidetINorgeSiste5År === JaEllerNei.NEI ||
    medlemskap?.iTilleggArbeidUtenforNorge === JaEllerNei.JA
  );
};

export const getMedlemskapSchema = (formatMessage: IntlFormatters['formatMessage']) => {
  return yup.object().shape({
    medlemskap: yup.object().shape({
      harBoddINorgeSiste5År: yup
        .mixed<JaEllerNei>()
        .required(
          formatMessage({ id: 'søknad.medlemskap.harBoddINorgeSiste5År.validation.required' })
        )
        .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
        .nullable(),
      harArbeidetINorgeSiste5År: yup.mixed<JaEllerNei>().when('harBoddINorgeSiste5År', {
        is: validateArbeidINorge,
        then: (yupSchema) =>
          yupSchema
            .required(
              formatMessage({
                id: 'søknad.medlemskap.harArbeidetINorgeSiste5År.validation.required',
              })
            )
            .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
            .nullable(),
        otherwise: (yupSchema) => yupSchema.notRequired(),
      }),
      arbeidetUtenforNorgeFørSykdom: yup
        .mixed<JaEllerNei>()
        .when(['harBoddINorgeSiste5År', 'harArbeidetINorgeSiste5År'], {
          is: validateArbeidUtenforNorgeFørSykdom,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({ id: 'søknad.medlemskap.arbeidUtenforNorge.validation.required' })
              )
              .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
              .nullable(),
          otherwise: (yupSchema) => yupSchema.notRequired(),
        }),
      iTilleggArbeidUtenforNorge: yup
        .mixed<JaEllerNei>()
        .when(['harBoddINorgeSiste5År', 'harArbeidetINorgeSiste5År'], {
          is: valideOgsåArbeidetUtenforNorge,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({
                  id: 'søknad.medlemskap.iTilleggArbeidUtenforNorge.validation.required',
                })
              )
              .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
              .nullable(),
          otherwise: (yupSchema) => yupSchema.notRequired(),
        }),
      utenlandsOpphold: yup
        .array()
        .when(['harBoddINorgeSiste5År', 'arbeidetUtenforNorgeFørSykdom'], {
          is: (harBoddINorgeSiste5År: JaEllerNei, arbeidetUtenforNorgeFørSykdom: JaEllerNei) =>
            harBoddINorgeSiste5År === JaEllerNei.JA &&
            arbeidetUtenforNorgeFørSykdom === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.boddINorgeArbeidUtenforNorge.validation.required',
                })
              )
              .min(
                1,
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.boddINorgeArbeidUtenforNorge.validation.required',
                })
              ),
        })
        .when(['iTilleggArbeidUtenforNorge'], {
          is: (iTilleggArbeidUtenforNorge: JaEllerNei) =>
            iTilleggArbeidUtenforNorge === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.ogsåArbeidUtenforNorge.validation.required',
                })
              )
              .min(
                1,
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.ogsåArbeidUtenforNorge.validation.required',
                })
              ),
        })
        .when(['harArbeidetINorgeSiste5År'], {
          is: (harArbeidetINorgeSiste5År: JaEllerNei) =>
            harArbeidetINorgeSiste5År === JaEllerNei.NEI,
          then: (yupSchema) =>
            yupSchema
              .required(
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.arbeidINorge.validation.required',
                })
              )
              .min(
                1,
                formatMessage({
                  id: 'søknad.medlemskap.utenlandsperiode.arbeidINorge.validation.required',
                })
              ),
        }),
    }),
  });
};

export function utenlandsPeriodeArbeidEllerBodd(medlemskap?: MedlemskapType) {
  if (
    medlemskap?.harBoddINorgeSiste5År === JaEllerNei.NEI &&
    medlemskap?.harArbeidetINorgeSiste5År === JaEllerNei.NEI
  ) {
    return ArbeidEllerBodd.BODD;
  }
  return ArbeidEllerBodd.ARBEID;
}

export const Medlemskap = ({ onBackClick, defaultValues }: Props) => {
  const { formatMessage } = useIntl();

  const { currentStepIndex, stepWizardDispatch, stepList } = useStepWizard();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const [selectedUtenlandsPeriode, setSelectedUtenlandsPeriode] = useState<UtenlandsPeriode>({});
  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    debouncedLagre(søknadState, stepList, {});
  }, [søknadState.søknad?.medlemskap]);

  const append = (utenlandsPeriode: UtenlandsPeriode) => {
    updateSøknadData(søknadDispatch, {
      medlemskap: {
        ...søknadState?.søknad?.medlemskap,
        utenlandsOpphold: [
          ...(søknadState?.søknad?.medlemskap?.utenlandsOpphold || []),
          {
            ...utenlandsPeriode,
          },
        ],
      },
    });
  };

  const update = (utenlandsPeriode: UtenlandsPeriode) => {
    updateSøknadData(søknadDispatch, {
      medlemskap: {
        ...søknadState?.søknad?.medlemskap,
        utenlandsOpphold: søknadState.søknad?.medlemskap?.utenlandsOpphold?.map((e) =>
          e.id === utenlandsPeriode.id ? utenlandsPeriode : e
        ),
      },
    });
  };

  const visArbeidINorge = validateArbeidINorge(
    søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År
  );

  const visArbeidUtenforNorgeFørSykdom = validateArbeidUtenforNorgeFørSykdom(
    søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År
  );

  const visOgsåArbeidetUtenforNorge = valideOgsåArbeidetUtenforNorge(
    søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
    søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År
  );

  const visLeggTilUtenlandsPeriode = validateUtenlandsPeriode(søknadState.søknad?.medlemskap);

  const arbeidEllerBodd = utenlandsPeriodeArbeidEllerBodd(søknadState?.søknad?.medlemskap);

  function clearErrors() {
    setErrors(undefined);
  }

  const findError = (path: string) => errors?.find((error) => error.path === path)?.message;
  const utenlandsOppholdErrorMessage = findError('medlemskap.utenlandsOpphold');

  console.log('errors', errors);

  return (
    <>
      <SoknadFormWrapperNew
        onNext={async () => {
          console.log(søknadState.søknad);
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
          updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
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
          value={defaultValues?.søknad?.medlemskap?.harBoddINorgeSiste5År || ''}
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
              value={defaultValues?.søknad?.medlemskap?.harArbeidetINorgeSiste5År || ''}
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
              value={defaultValues?.søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom || ''}
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
              value={defaultValues?.søknad?.medlemskap?.iTilleggArbeidUtenforNorge || ''}
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
            {defaultValues?.søknad?.medlemskap?.utenlandsOpphold &&
              defaultValues?.søknad.medlemskap.utenlandsOpphold.length > 0 && (
                <UtenlandsOppholdTabell
                  utenlandsPerioder={defaultValues?.søknad?.medlemskap.utenlandsOpphold}
                  setSelectedUtenlandsPeriode={setSelectedUtenlandsPeriode}
                  setShowUtenlandsPeriodeModal={setShowUtenlandsPeriodeModal}
                  arbeidEllerBodd={arbeidEllerBodd}
                />
              )}
            <Grid>
              <Cell xs={12}>
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
              </Cell>
            </Grid>

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
          setSelectedUtenlandsPeriode({});
          setShowUtenlandsPeriodeModal(!showUtenlandsPeriodeModal);
        }}
        onSave={(utenlandsperiode) => {
          if (selectedUtenlandsPeriode.id === undefined) {
            append({ ...utenlandsperiode, id: uuid4() });
          } else {
            update(utenlandsperiode);
          }
        }}
      />
    </>
  );
};
