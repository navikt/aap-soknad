import {
  BodyShort,
  Button,
  Cell,
  Grid,
  Heading,
  Radio,
  RadioGroup,
  ReadMore,
  Table,
} from '@navikt/ds-react';
import React, { useMemo, useState } from 'react';
import { JaEllerNei } from 'types/Generic';
import { Add, Delete } from '@navikt/ds-icons';
import UtenlandsPeriodeVelger, {
  ArbeidEllerBodd,
} from '..//UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';
import { formatDate } from 'utils/date';
import { validate } from 'lib/utils/validationUtils';
import { Soknad } from 'types/Soknad';
import { completeAndGoToNextStep, useStepWizard } from 'context/stepWizardContextV2';
import * as yup from 'yup';
import ColorPanel from 'components/panel/ColorPanel';
import { LucaGuidePanel } from '@navikt/aap-felles-react';
import * as styles from './Medlemskap.module.css';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { setFocusOnErrorSummary } from 'components/schema/FormErrorSummary';
import { IntlFormatters, useIntl } from 'react-intl';
import SoknadFormWrapperNew from 'components/SoknadFormWrapper/SoknadFormWrapperNew';
import { logSkjemastegFullførtEvent } from 'utils/amplitude';
import { SøknadValidationError } from 'components/schema/FormErrorSummaryNew';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { updateSøknadData } from 'context/soknadContextCommon';

interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

const UTENLANDSOPPHOLD = 'utenlandsOpphold';
export const BODD_I_NORGE = 'harBoddINorgeSiste5År';
const ARBEID_UTENFOR_NORGE_FØR_SYKDOM = 'arbeidetUtenforNorgeFørSykdom';
const OGSÅ_ARBEID_UTENFOR_NORGE = 'iTilleggArbeidUtenforNorge';
export const ARBEID_I_NORGE = 'harArbeidetINorgeSiste5År';
const MEDLEMSKAP = 'medlemskap';

const validateArbeidINorge = (boddINorge?: JaEllerNei | null) => boddINorge === JaEllerNei.NEI;
const validateArbeidUtenforNorgeFørSykdom = (boddINorge?: JaEllerNei | null) =>
  boddINorge === JaEllerNei.JA;
const valideOgsåArbeidetUtenforNorge = (boddINorge?: JaEllerNei | null, JobbINorge?: JaEllerNei) =>
  boddINorge === JaEllerNei.NEI && JobbINorge === JaEllerNei.JA;
const validateUtenlandsPeriode = (
  arbeidINorge?: JaEllerNei,
  arbeidUtenforNorge?: JaEllerNei,
  iTilleggArbeidUtenforNorge?: JaEllerNei
) => {
  return (
    arbeidUtenforNorge === JaEllerNei.JA ||
    arbeidINorge === JaEllerNei.NEI ||
    iTilleggArbeidUtenforNorge === JaEllerNei.JA
  );
};

export const getMedlemskapSchema = (formatMessage: IntlFormatters['formatMessage']) => {
  return yup.object().shape({
    [MEDLEMSKAP]: yup.object().shape({
      [BODD_I_NORGE]: yup
        .mixed<JaEllerNei>()
        .required(
          formatMessage({ id: 'søknad.medlemskap.harBoddINorgeSiste5År.validation.required' })
        )
        .oneOf([JaEllerNei.JA, JaEllerNei.NEI])
        .nullable(),
      [ARBEID_I_NORGE]: yup.mixed<JaEllerNei>().when(BODD_I_NORGE, {
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
      [ARBEID_UTENFOR_NORGE_FØR_SYKDOM]: yup
        .mixed<JaEllerNei>()
        .when([BODD_I_NORGE, ARBEID_I_NORGE], {
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
      [OGSÅ_ARBEID_UTENFOR_NORGE]: yup.mixed<JaEllerNei>().when([BODD_I_NORGE, ARBEID_I_NORGE], {
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
      [UTENLANDSOPPHOLD]: yup
        .array()
        .when([BODD_I_NORGE, ARBEID_UTENFOR_NORGE_FØR_SYKDOM], {
          is: (boddINorge: JaEllerNei, arbeidUtenforNorge: JaEllerNei) =>
            boddINorge === JaEllerNei.JA && arbeidUtenforNorge === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema.min(
              1,
              formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.boddINorgeArbeidUtenforNorge.validation.required',
              })
            ),
        })
        .when([OGSÅ_ARBEID_UTENFOR_NORGE], {
          is: (ogsåArbeidUtenforNorge: JaEllerNei) => ogsåArbeidUtenforNorge === JaEllerNei.JA,
          then: (yupSchema) =>
            yupSchema.min(
              1,
              formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.ogsåArbeidUtenforNorge.validation.required',
              })
            ),
        })
        .when([ARBEID_I_NORGE], {
          is: (arbeidINorge: JaEllerNei) => arbeidINorge === JaEllerNei.NEI,
          then: (yupSchema) =>
            yupSchema.min(
              1,
              formatMessage({
                id: 'søknad.medlemskap.utenlandsperiode.arbeidINorge.validation.required',
              })
            ),
        }),
    }),
  });
};
export const utenlandsPeriodeArbeidEllerBodd = (
  arbeidINorge?: JaEllerNei,
  boddINorge?: JaEllerNei | null
) => {
  if (boddINorge === JaEllerNei.NEI && arbeidINorge === JaEllerNei.NEI) {
    return ArbeidEllerBodd.BODD;
  }
  return ArbeidEllerBodd.ARBEID;
};
export const Medlemskap = ({ onBackClick, defaultValues }: Props) => {
  const { formatMessage } = useIntl();

  const { currentStepIndex, stepWizardDispatch, stepList } = useStepWizard();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const [showUtenlandsPeriodeModal, setShowUtenlandsPeriodeModal] = useState<boolean>(false);
  const [selectedUtenlandsPeriodeIndex, setSelectedUtenlandsPeriodeIndex] = useState<
    number | undefined
  >(undefined);

  const append = (thing) => console.log('append', thing);
  const update = (index: number, thing: any) => console.log('update', thing);
  const remove = (thing) => console.log('remove', thing);

  const selectedUtenlandsPeriode = undefined;

  const [errors, setErrors] = useState<SøknadValidationError[] | undefined>();
  const showArbeidINorge = useMemo(
    () => validateArbeidINorge(søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År),
    [søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År]
  );
  const showArbeidUtenforNorgeFørSykdom = useMemo(
    () =>
      validateArbeidUtenforNorgeFørSykdom(søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År),
    [søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År]
  );
  const showOgsåArbeidetUtenforNorge = useMemo(
    () =>
      valideOgsåArbeidetUtenforNorge(
        søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
        søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År
      ),
    [
      søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
      søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År,
    ]
  );
  const showLeggTilUtenlandsPeriode = useMemo(
    () =>
      validateUtenlandsPeriode(
        søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År,
        søknadState?.søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom,
        søknadState?.søknad?.medlemskap?.iTilleggArbeidUtenforNorge
      ),
    [
      søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År,
      søknadState?.søknad?.medlemskap?.arbeidetUtenforNorgeFørSykdom,
      søknadState?.søknad?.medlemskap?.iTilleggArbeidUtenforNorge,
    ]
  );

  const arbeidEllerBodd = useMemo(
    () =>
      utenlandsPeriodeArbeidEllerBodd(
        søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År,
        søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År
      ),
    [
      søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År,
      søknadState?.søknad?.medlemskap?.harBoddINorgeSiste5År,
    ]
  );

  function clearErrors() {
    setErrors(undefined);
  }

  return (
    <>
      <SoknadFormWrapperNew
        onNext={async () => {
          const errors = await validate(
            getMedlemskapSchema(formatMessage),
            søknadState.søknad?.student
          );
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
          name={`${BODD_I_NORGE}`}
          id={`${BODD_I_NORGE}`}
          legend={formatMessage({ id: 'søknad.medlemskap.harBoddINorgeSiste5År.label' })}
          value={defaultValues?.søknad?.medlemskap?.harBoddINorgeSiste5År || ''}
          onChange={(value) => {
            clearErrors();
            updateSøknadData(søknadDispatch, { medlemskap: { harBoddINorgeSiste5År: value } });
          }}
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
        {showArbeidINorge && (
          <>
            <RadioGroup
              name={`${ARBEID_I_NORGE}`}
              id={`${ARBEID_I_NORGE}`}
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
        {showArbeidUtenforNorgeFørSykdom && (
          // Gjelder §11-19 og beregning av utbetaling. Skal kun komme opp hvis §11-2 er oppfyltt
          <>
            <RadioGroup
              name={`${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`}
              id={`${ARBEID_UTENFOR_NORGE_FØR_SYKDOM}`}
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
        {showOgsåArbeidetUtenforNorge && (
          <>
            <RadioGroup
              name={`${OGSÅ_ARBEID_UTENFOR_NORGE}`}
              id={`${OGSÅ_ARBEID_UTENFOR_NORGE}`}
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
        {showLeggTilUtenlandsPeriode && (
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
            {søknadState?.søknad?.medlemskap?.utenlandsOpphold?.length &&
            søknadState?.søknad?.medlemskap?.utenlandsOpphold?.length > 0 ? (
              <Table size="medium">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell colSpan={2}>
                      <Heading size="xsmall" level="3">
                        {formatMessage({
                          id: `søknad.medlemskap.utenlandsperiode.perioder.title.${arbeidEllerBodd}`,
                        })}
                      </Heading>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {søknadState?.søknad?.medlemskap?.utenlandsOpphold?.map((field, index) => (
                    <Table.Row key={field.id}>
                      <Table.DataCell className={styles.dataCell}>
                        <Button
                          variant="tertiary"
                          type="button"
                          onClick={() => {
                            setSelectedUtenlandsPeriodeIndex(index);
                            setShowUtenlandsPeriodeModal(true);
                          }}
                        >
                          <div className={styles.tableRowButtonContainer}>
                            <span>{`${field?.land?.split(':')?.[1]} `}</span>
                            <span>
                              {`${formatDate(field?.fraDato, 'MMMM yyyy')} - ${formatDate(
                                field?.tilDato,
                                'MMMM yyyy'
                              )}${field?.iArbeid === 'Ja' ? ' (Jobb)' : ''}`}
                            </span>
                          </div>
                        </Button>
                      </Table.DataCell>
                      <Table.DataCell>
                        <Button
                          type={'button'}
                          variant={'tertiary'}
                          onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                              remove(index);
                            }
                          }}
                          onClick={() => remove(index)}
                          icon={
                            <Delete
                              className={styles.deleteIcon}
                              title={'Slett utenlandsopphold'}
                              role={'button'}
                              tabIndex={0}
                            />
                          }
                          iconPosition={'left'}
                        >
                          Fjern
                        </Button>
                      </Table.DataCell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <></>
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
                    setSelectedUtenlandsPeriodeIndex(undefined);
                    setShowUtenlandsPeriodeModal(true);
                  }}
                >
                  {søknadState?.søknad?.medlemskap?.harArbeidetINorgeSiste5År === JaEllerNei.NEI
                    ? 'Registrer utenlandsopphold'
                    : 'Registrer periode med jobb utenfor Norge'}
                </Button>
              </Cell>
            </Grid>

            {/* TODO: react-hook-form antar at vi kun har validering på hvert enkelt field i FieldArrays */}
            {/* @ts-ignore-line */}
            {errors?.[MEDLEMSKAP]?.[UTENLANDSOPPHOLD]?.message ? (
              <div className={'navds-error-message navds-error-message--medium navds-label'}>
                {/* @ts-ignore-line*/}
                {errors?.[MEDLEMSKAP]?.[UTENLANDSOPPHOLD]?.message}
              </div>
            ) : (
              <></>
            )}
          </ColorPanel>
        )}
      </SoknadFormWrapperNew>
      <UtenlandsPeriodeVelger
        utenlandsPeriode={selectedUtenlandsPeriode}
        open={showUtenlandsPeriodeModal}
        onSave={(data) => {
          if (selectedUtenlandsPeriode === undefined) {
            append({ ...data });
          } else if (selectedUtenlandsPeriodeIndex !== undefined) {
            update(selectedUtenlandsPeriodeIndex, { ...data });
          }

          setShowUtenlandsPeriodeModal(false);
        }}
        arbeidEllerBodd={arbeidEllerBodd}
        onCancel={() => setShowUtenlandsPeriodeModal(false)}
        onClose={() => setShowUtenlandsPeriodeModal(false)}
      />
    </>
  );
};
