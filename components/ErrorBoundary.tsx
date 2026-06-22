import { BodyShort, Heading, HStack, Link } from '@navikt/ds-react';
import { Component, ErrorInfo, ReactNode } from 'react';
import { faro } from '@grafana/faro-web-sdk';

class ErrorBoundary extends Component<{children: ReactNode},{hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    faro.api?.pushError(error);
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      return (
        <HStack justify={'center'}>
          <div>
            <Heading level="1" size="large" spacing>
              {'Beklager, noe gikk galt'}
            </Heading>
            <BodyShort size={'large'} spacing>
              {'En teknisk feil gjør at søknaden er midlertidig utilgjengelig.'}
            </BodyShort>
            <BodyShort size={'large'} spacing>
              {'Du kan prøve å vente noen minutter og '}
              <Link href="#" onClick={() => window.location.reload()}>
                laste siden på nytt
              </Link>
            </BodyShort>
            <BodyShort size={'large'} spacing>
              {'Hvis problemet vedvarer, kan du '}
              <Link href="https://www.nav.no/kontaktoss" target="_blank">
                kontakte oss (åpnes i ny fane)
              </Link>
            </BodyShort>
          </div>
        </HStack>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
