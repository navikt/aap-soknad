import { BodyShort, Box, Button, HGrid, Heading, Link, List, Page, VStack } from '@navikt/ds-react';
import Body from '@navikt/ds-react/esm/table/Body';

const ErrorPage = () => {
  return (
    <Page>
      <Page.Block as="main" width="xl" gutters>
        <Box paddingBlock="20 8">
          <HGrid columns="minmax(auto,600px)">
            <VStack gap="16">
              <VStack gap="12" align="start">
                <div>
                  <BodyShort textColor="subtle" size="small">
                    Statuskode 500
                  </BodyShort>
                  <Heading level="1" size="large" spacing>
                    Beklager, noe gikk galt.
                  </Heading>
                  {/* Tekster bør tilpasses den aktuelle 500-feilen. Teksten under er for en generisk 500-feil. */}
                  <BodyShort spacing>
                    En teknisk feil på våre servere gjør at søknaden er utilgjengelig. Dette skyldes
                    ikke noe du gjorde.
                  </BodyShort>
                  <BodyShort>Du kan prøve å</BodyShort>
                  <List>
                    <List.Item>
                      vente noen minutter og{' '}
                      <Link href="#" onClick={() => location.reload()}>
                        laste siden på nytt
                      </Link>
                    </List.Item>
                  </List>
                  <BodyShort spacing>
                    Hvis problemet vedvarer, kan du{' '}
                    {/* https://nav.no/kontaktoss for eksterne flater */}
                    <Link href="https://www.nav.no/kontaktoss" target="_blank">
                      kontakte oss (åpnes i ny fane)
                    </Link>
                    , eller{' '}
                    <Link href="https://www.nav.no/fyllut/nav111305?sub=paper">
                      sende oss søknaden på papir
                    </Link>
                    .
                  </BodyShort>
                </div>
              </VStack>

              <div>
                <Heading level="1" size="large" spacing>
                  Something went wrong
                </Heading>
                <BodyShort spacing>
                  This was caused by a technical fault on our servers. It was not your fault.
                </BodyShort>
                <BodyShort>You can try to</BodyShort>
                <List>
                  <List.Item>
                    wait a few minutes and{' '}
                    <Link href="#" onClick={() => location.reload()}>
                      refresh the page
                    </Link>
                  </List.Item>
                </List>
                <BodyShort>
                  {/* https://www.nav.no/kontaktoss/en for eksterne flater */}
                  <Link target="_blank" href="https://www.nav.no/kontaktoss/en">
                    Contact us (opens in new tab)
                  </Link>{' '}
                  if the problem persists. You can also{' '}
                  <Link href="https://www.nav.no/fyllut/nav111305?sub=paper">
                    send us an application by post (page in Norwegian)
                  </Link>
                  .
                </BodyShort>
              </div>
            </VStack>
          </HGrid>
        </Box>
      </Page.Block>
    </Page>
  );
};

export default ErrorPage;
