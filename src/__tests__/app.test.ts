import * as request from "supertest";
import { createApp } from "../app";
import { UserActivationDocument } from "../models/user_activation_document";
import { mocked } from "ts-jest/utils";
import {
  aValidLegalFactDownloadMetadataResponse,
  aValidNotificationAttachmentDownloadMetadataResponse
} from "../__mocks__/variables";

jest.mock("../models/user_activation_document");
jest.mock("../utils/functions_services_client.ts");

const aFiscalCode = "AAAAAA00T11B123B";

describe("app", () => {
  let app: any;
  beforeAll(() => {
    app = request(createApp());
  });

  beforeEach(() => {
    //ts-jest utility to remove the function error while calling UserActivationDocument.mockClear()
    mocked(UserActivationDocument).mockClear();
  });

  const endpoint = "/address-book-io/v1/digital-address/courtesy";

  describe("GET /address-book-io/v1/digital-address/courtesy", () => {
    it("should return a 400 error if the x-pagopa-cx-taxid header is not provided", async () => {
      const res = await app.get(endpoint).set({ "x-api-key": "key" });
      expect(UserActivationDocument).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it("should return a 200 if the x-pagopa-cx-taxid header is provided", async () => {
      const res = await app
        .get(endpoint)
        .set({ "x-pagopa-cx-taxid": aFiscalCode, "x-api-key": "key" });
      expect(UserActivationDocument).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(200);
    });

    it("should return a 403 error if the x-api-key header is not provided", async () => {
      const res = await app.get(endpoint);
      expect(UserActivationDocument).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });
  });

  describe("PUT /address-book-io/v1/digital-address/courtesy", () => {
    it("should return 400 error if the x-pagopa-cx-taxid header is not provided", async () => {
      const res = await app.put(endpoint).set({ "x-api-key": "key" });
      expect(UserActivationDocument).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it("should return 400 error if the body is malformed", async () => {
      const res = await app
        .put(endpoint)
        .set({ "x-api-key": "key" })
        .send({ activationStatus: null });
      expect(UserActivationDocument).not.toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    it("should return a 204 if the x-pagopa-cx-taxid header is provided", async () => {
      const res = await app
        .put(endpoint)
        .set({ "x-pagopa-cx-taxid": aFiscalCode, "x-api-key": "key" })
        .send({ activationStatus: true });
      expect(UserActivationDocument).toHaveBeenCalledTimes(1);
      expect(res.status).toBe(204);
    });

    it("should return a 403 error if the x-api-key header is not provided", async () => {
      const res = await app.put(endpoint);
      expect(UserActivationDocument).not.toHaveBeenCalled();
      expect(res.status).toBe(403);
    });
  });

  describe("GET /delivery/notifications/received/:iun?", () => {
    it("should return a 400 error if the x-pagopa-cx-taxid is not provided", async () => {
      const res = await app.get("/delivery/notifications/received/validIun");
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe("taxId must be provided inside headers");
    });

    it("should return a 400 error if the iun is not valid", async () => {
      const res = await app
        .get("/delivery/notifications/received/")
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe(
        "The iun provided is not valid, please check for existance"
      );
    });

    it("should return a 200 if the iun is provided inside params", async () => {
      const res = await app
        .get("/delivery/notifications/received/validIun")
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(200);
      expect(res.body.paProtocolNumber).toBe("1");
    });
  });

  describe("GET /delivery/notifications/sent/:iun?/attachments/documents/:docIdx?", () => {
    it("should return a 400 error if the x-pagopa-cx-taxid is not provided inside headers", async () => {
      const res = await app.get(
        "/delivery/notifications/sent/validIun/attachments/documents/:docIdx?"
      );
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe("taxId must be provided inside headers");
    });

    it("should return a 400 error if the x-pagopa-cx-taxid is provided inside headers but iun is not valid", async () => {
      const res = await app
        .get("/delivery/notifications/sent/attachments/documents/:docIdx?")
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe(
        "The iun provided is not valid, please check for existance"
      );
    });

    it("should return a 400 error if the x-pagopa-cx-taxid and iun are valid but docIdx is missing", async () => {
      const res = await app
        .get("/delivery/notifications/sent/validIun/attachments/documents/")
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe(
        "docIdx must be provided inside params as non empty string"
      );
    });

    it("should return a 200 if the x-pagopa-cx-taxid, iun and docIdx are valid", async () => {
      const res = await app
        .get("/delivery/notifications/sent/validIun/attachments/documents/1")
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual(
        aValidNotificationAttachmentDownloadMetadataResponse
      );
    });
  });

  describe("GET /delivery-push/:iun?/legal-facts/:legalFactType?/:legalFactId?", () => {
    it("should return a 400 error if the x-pagopa-cx-taxid is not provided", async () => {
      const res = await app.get(
        "/delivery-push/validIun/legal-facts/SENDER_ACK/legalFactId"
      );
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe("taxId must be provided inside headers");
    });

    it("should return a 400 error if the x-pagopa-cx-taxid is provided but iun is missing", async () => {
      const res = await app
        .get("/delivery-push/legal-facts/SENDER_ACK/legalFactId")
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe(
        "The iun provided is not valid, please check for existance"
      );
    });

    it("should return a 400 error if the x-pagopa-cx-taxid and iun are provided but legalFactType is not valid", async () => {
      const res = await app
        .get(
          "/delivery-push/validIun/legal-facts/invalidLegalFactType/legalFactId"
        )
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe(
        "legalFactType must be one of the following: SENDER_ACK | DIGITAL_DELIVERY | ANALOG_DELIVERY | RECIPIENT_ACCESS"
      );
    });

    it("should return a 400 error if the x-pagopa-cx-taxid, iun and legalFactType are valid but legalFactId is not provided", async () => {
      const res = await app
        .get("/delivery-push/validIun/legal-facts/SENDER_ACK/")
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(400);
      expect(res.body.detail).toBe(
        "Invalid legalFactId, please check for existance"
      );
    });

    it("should return a 200 if the request is well formed", async () => {
      const res = await app
        .get("/delivery-push/validIun/legal-facts/SENDER_ACK/validLegalFactId")
        .set({ "x-pagopa-cx-taxid": aFiscalCode });
      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual(aValidLegalFactDownloadMetadataResponse);
    });
  });
});
