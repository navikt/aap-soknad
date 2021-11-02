import fetchMock from "fetch-mock";
import { meMock } from "./data/me";

fetchMock.config.fallbackToNetwork = true;

fetchMock.get(
  '/aap/api/me',
  {
    status: 200,
    body: meMock
  },
  {
    delay: 1000
  }
);

fetchMock.post(
  '/aap/api/innsending/utland',
  {
    status: 500,
    body: {}
  },
  {
    delay: 3000
  }
);
