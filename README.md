# Create-React-App eksempel prosjekt

Basert på create-react-app fra nav-frontend-moduler

Satt opp for å støtte lasting av `less` filer ved hjelp av `craco-less` https://github.com/DocSpring/craco-less#readme.

Prosjektet kjører `pretty-quick` on-`git commit` for automatisk kjøring av prettier, samt linting av js/ts og less on-`git push`.

Development og linting:

```
yarn install
yarn start
```

Bygging for produksjon:

```
yarn install
yarn run build
```

For å kjøre build lokalt kan `serve` brukes:
https://www.npmjs.com/package/serve

```
yarn install -g serve
serve build
```
