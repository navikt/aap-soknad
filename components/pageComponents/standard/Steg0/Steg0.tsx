import { IntroduksjonTekst } from 'components/IntroduksjonTekst/IntroduksjonTekst';
import { SokerOppslagState } from 'context/sokerOppslagContext';
import * as classes from './Steg0.module.css';
import { BodyShort, Label } from '@navikt/ds-react';
import { SuccessColored } from '@navikt/ds-icons';
import { useIntl } from 'react-intl';
import SøknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';

interface Props {
  onNext: () => void;
  søker: SokerOppslagState;
}

export const Steg0 = ({ onNext, søker }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SøknadFormWrapper
      className={classes?.paddingTop}
      onNext={onNext}
      nextButtonText={formatMessage({ id: 'navigation.next' })}
    >
      <IntroduksjonTekst navn={søker.søker.navn} />

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
