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
