import { createRequest, createResponse} from "node-mocks-http";
import { Request, Response} from "express";

import { enforceIDPortenAuthenticationMiddleware } from '../src/auth';
import { validerToken } from "../src/auth/idporten";

jest.mock("../src/auth/idporten");

const mockValider = validerToken as jest.MockedFunction<typeof validerToken>;

describe("server/authentication", () => {
  afterEach(() => {
    mockValider.mockClear();
  });

  test("redirect til idporten login hvis authentication mangler", async () => {
    const req = createRequest<Request>();
    const res = createResponse<Response>();
    await enforceIDPortenAuthenticationMiddleware(req, res, () => 'next');
    expect(res.statusCode).toEqual(302);
    expect(res._getRedirectUrl()).toEqual('/oauth2/login?redirect=/');
  });

  test("redirect til idporten login hvis authentication ikke validerer", async () => {
    const req = createRequest<Request>({
      headers: {
        authorization: "Bearer foo",
      },
      cookies: {
        'selvbetjening-idtoken': 'foo'
      }
    });
    const res = createResponse<Response>();
    await enforceIDPortenAuthenticationMiddleware(req, res, () => 'next');
    expect(res.statusCode).toEqual(302);
    expect(res._getRedirectUrl()).toEqual('/oauth2/login?redirect=/');
  });

  test("redirect til loginservice hvis selvbetjening-idtoken cookie mangler", async () => {
    const req = createRequest<Request>({headers: {
      authorization: "Bearer foo",
    }});
    const res = createResponse<Response>();
    await enforceIDPortenAuthenticationMiddleware(req, res, () => 'next');
    expect(res.statusCode).toEqual(302);
    expect(res._getRedirectUrl()).toEqual('undefined?redirect=localhost:3000/aap/loginservice');
  });
});
