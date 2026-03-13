import { BodyShort, Box, Heading, HGrid, Page, VStack } from '@navikt/ds-react';

export default function NotFound() {
  return (
    <Page>
      <Page.Block as="main" width="xl" gutters>
        <Box paddingBlock="20 8">
          <HGrid columns="minmax(auto,600px)">
            <VStack gap="8">
              <BodyShort textColor="subtle" size="small">
                Statuskode 404
              </BodyShort>
              <Heading level="1" size="large" spacing>
                Siden finnes ikke
              </Heading>
              <BodyShort>Beklager, siden du leter etter finnes ikke.</BodyShort>
            </VStack>
          </HGrid>
        </Box>
      </Page.Block>
    </Page>
  );
}
