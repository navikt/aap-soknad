import { BodyLong, BodyShort, GuidePanel, Heading, Radio } from '@navikt/ds-react';
import React from 'react';
import { GetText } from '../../hooks/useTexts';
import { Control, FieldErrors, FieldValues } from 'react-hook-form';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';

interface BarnetilleggProps {
  getText: GetText;
  errors: FieldErrors;
  control: Control<FieldValues>;
  barneListe: Array<any>;
}
enum JaNei {
  JA = 'JA',
  NEI = 'NEI',
}
export const Barnetillegg = ({ getText, errors, control, barneListe }: BarnetilleggProps) => {
  return (
    <>
      <BodyLong>{getText('steps.barnetillegg.ingress')}</BodyLong>
      {barneListe.map((barn, index) => (
        <GuidePanel key={`barn-${index}`} poster>
          <Heading
            size={'xsmall'}
            level={'2'}
          >{`${barn?.navn?.fornavn} ${barn?.navn?.mellomnavn} ${barn?.navn?.etternavn}`}</Heading>
          <RadioGroupWrapper
            legend={getText('form.barnetillegg.legend')}
            name={`barnetillegg.${index}.${barn?.navn?.fornavn}${barn?.navn?.mellomnavn}${barn?.navn?.etternavn}`}
            control={control}
            error={
              errors?.[index]?.[
                `${barn?.navn?.fornavn}${barn?.navn?.mellomnavn}${barn?.navn?.etternavn}`
              ]?.message
            }
          >
            <Radio value={JaNei.JA}>
              <BodyShort>{getText('form.barnetillegg.ja')}</BodyShort>
            </Radio>
            <Radio value={JaNei.NEI}>
              <BodyShort>{getText('form.barnetillegg.nei')}</BodyShort>
            </Radio>
          </RadioGroupWrapper>
        </GuidePanel>
      ))}
    </>
  );
};
