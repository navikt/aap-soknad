import React from 'react';
import { Vedlegg } from '../../../../types/Soknad';
import { useForm } from 'react-hook-form';
import TextFieldWrapper from '../../../input/TextFieldWrapper';
import { MyNewFileInput } from '../../../input/FileInput/MyNewFileInput';
import { Button } from '@navikt/ds-react';
import { AttachmentType } from '../AndreUtbetalinger/AndreUtbetalinger';

export interface FormFields {
  navn: string;
  lønnOgAndreGoder: Vedlegg[];
  omsorgstønad: Vedlegg[];
  utlandsstønad: Vedlegg[];
  avbruttStudie: Vedlegg[];
  sykestipend: Vedlegg[];
  lån: Vedlegg[];
  annet: Vedlegg[];
}

export const MyComponent = () => {
  const { control, handleSubmit } = useForm<FormFields>();

  return (
    <form
      style={{ display: 'grid', gridTemplateColumns: '1fr', gridRowGap: '1rem' }}
      onSubmit={handleSubmit((data) => console.log(data))}
    >
      <TextFieldWrapper name={'navn'} label={'Hva er ditt navn?'} control={control} />
      <MyNewFileInput control={control} name={'lønnOgAndreGoder'} heading={'Lønn og andre goder'} />
      <MyNewFileInput control={control} name={'omsorgstønad'} heading={'Omsorgstønad'} />
      <MyNewFileInput control={control} name={'utlandsstønad'} heading={'Utlandsstønad'} />
      <MyNewFileInput control={control} name={'avbruttStudie'} heading={'Avbrutt studie'} />
      <MyNewFileInput control={control} name={'sykestipend'} heading={'Sykestipend'} />
      <MyNewFileInput control={control} name={'lån'} heading={'Lån'} />
      <MyNewFileInput control={control} name={'annet'} heading={'Annet'} />
      <Button>Fullfør</Button>
    </form>
  );
};
