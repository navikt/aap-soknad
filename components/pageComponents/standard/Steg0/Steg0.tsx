import SøknadFormWrapper from '../../../SoknadFormWrapper/SoknadFormWrapper';
import { slettLagretSoknadState } from '../../../../context/soknadContextCommon';
import { Soknad } from '../../../../types/Soknad';
import {
  deleteOpplastedeVedlegg,
  useSoknadContextStandard,
} from '../../../../context/soknadContextStandard';
import { IntroduksjonTekst } from '../../../IntroduksjonTekst/IntroduksjonTekst';
import { SokerOppslagState } from '../../../../context/sokerOppslagContext';
import { getFulltNavn } from '../../../../lib/søker';
import * as classes from './Steg0.module.css';
import { BodyShort, Label } from '@navikt/ds-react';
import { SuccessColored } from '@navikt/ds-icons';
import { useIntl } from 'react-intl';

interface Props {
  onNext: () => void;
  søker: SokerOppslagState;
}

export const Steg0 = ({ onNext, søker }: Props) => {
  const { formatMessage } = useIntl();
  const { søknadState, søknadDispatch } = useSoknadContextStandard();

  return (
    <SøknadFormWrapper
      className={classes?.paddingTop}
      onNext={onNext}
      onDelete={async () => {
        await deleteOpplastedeVedlegg(søknadState.søknad);
        await slettLagretSoknadState<Soknad>(søknadDispatch, søknadState);
      }}
      nextButtonText={formatMessage({ id: 'navigation.next' })}
      backButtonText={formatMessage({ id: 'navigation.back' })}
      cancelButtonText={formatMessage({ id: 'navigation.cancel' })}
    >
      <IntroduksjonTekst navn={getFulltNavn(søker.søker)} />

      <div>
        <Label as="p" spacing>
          {formatMessage({ id: 'søknad.veiledning.veiledningConfirm.title' })}
        </Label>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <SuccessColored />
          <BodyShort>
            {formatMessage({ id: 'søknad.veiledning.veiledningConfirm.label' })}
          </BodyShort>
        </div>
      </div>
    </SøknadFormWrapper>
  );
};
