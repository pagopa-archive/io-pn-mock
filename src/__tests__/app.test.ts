import * as request from "supertest";
import { createApp } from "../app";
import { UserActivationDocument } from "../models/user_activation_document";
import { mocked } from "ts-jest/utils"

jest.mock("../models/user_activation_document");
jest.mock("../utils/functions_services_client.ts");

const aFiscalCode = "AAAAAA00T11B123B";

describe("app", () => {
  let app: any;
  beforeAll(() => {
    app = request(createApp())
  })

  beforeEach(() => {
    //ts-jest utility to remove the function error while calling UserActivationDocument.mockClear()
    mocked(UserActivationDocument).mockClear();
  })

  const endpoint = "/address-book-io/v1/digital-address/courtesy"

  describe("GET /address-book-io/v1/digital-address/courtesy", () => {
    it("should return a 400 error if the x-pagopa-cx-taxid header is not provided", async () => {
      const res = await app.get(endpoint).set({ "x-api-key": "key" });
      expect(UserActivationDocument).not.toHaveBeenCalled()
      expect(res.status).toBe(400);
    })

    it("should return a 200 if the x-pagopa-cx-taxid header is provided", async () => {
      const res = await app.get(endpoint).set({ "x-pagopa-cx-taxid": aFiscalCode, "x-api-key": "key" });
      expect(UserActivationDocument).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);
    })

    it("should return a 403 error if the x-api-key header is not provided", async () => {
      const res = await app.get(endpoint);
      expect(UserActivationDocument).not.toHaveBeenCalled()
      expect(res.status).toBe(403);
    })
  })

  describe("PUT /address-book-io/v1/digital-address/courtesy", () => {
    it("should return 400 error if the x-pagopa-cx-taxid header is not provided", async () => {
      const res = await app.put(endpoint).set({ "x-api-key": "key" });
      expect(UserActivationDocument).not.toHaveBeenCalled()
      expect(res.status).toBe(400);
    });

    it("should return 400 error if the body is malformed", async () => {
      const res = await app.put(endpoint).set({ "x-api-key": "key" }).send({ activationStatus: null });
      expect(UserActivationDocument).not.toHaveBeenCalled()
      expect(res.status).toBe(400);
    })

    it("should return a 204 if the x-pagopa-cx-taxid header is provided", async () => {
      const res = await app.put(endpoint).set({ "x-pagopa-cx-taxid": aFiscalCode, "x-api-key": "key" }).send({ activationStatus: true });
      expect(UserActivationDocument).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(204);
    })

    it("should return a 403 error if the x-api-key header is not provided", async () => {
      const res = await app.put(endpoint);
      expect(UserActivationDocument).not.toHaveBeenCalled()
      expect(res.status).toBe(403);
    })
  })
})
