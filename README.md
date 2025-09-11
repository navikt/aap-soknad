# AAP Søknad

Søknad for arbeidsavklaringspenger med idporten innlogging (wonderwall). Skrevet i NextJS.

## Bygge og kjøre app lokalt

### Github package registry

Vi bruker Github sitt package registry for npm pakker, siden flere av Nav sine pakker kun blir publisert her.

For å kunne kjøre `yarn install` lokalt må du logge inn mot Github package registry. Legg til følgende i .bashrc eller .zshrc lokalt på din maskin:
I .bashrc eller .zshrc:

`export NPM_AUTH_TOKEN=github_pat`

Hvor github_pat er din personal access token laget på github(settings -> developer settings). Husk read:packages rettighet og enable sso når du oppdaterer/lager PAT.


### Kjøre lokalt

- Kopier filen `.env.template` til `.env.local`
- Kjør `yarn dev`
- Åpne http://localhost:3000/aap/soknad

---

# Henvendelser

---

Spørsmål knyttet til koden eller prosjektet kan stilles som issues her på GitHub

# For NAV-ansatte

---

Interne henvendelser kan sendes via Slack i kanalen #po-aap-værsågod.
