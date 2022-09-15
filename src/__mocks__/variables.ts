import { FullReceivedNotification } from "../generated/FullReceivedNotification";
import {
  NotificationFeePolicyEnum,
  PhysicalCommunicationTypeEnum
} from "../generated/NewNotificationRequest";
import { NotificationAttachmentDownloadMetadataResponse } from "../generated/NotificationAttachmentDownloadMetadataResponse";
import { LegalFactDownloadMetadataResponse } from "../generated/LegalFactDownloadMetadataResponse";

/**represent a list of existing iun*/
export const validIunList: string[] = ["validIun", "0", "test", "example"];

/**represent a list of existing legalFact*/
export const validLegalFactList = [
  { category: "SENDER_ACK", key: "validLegalFactId" }
];

/**represent a list of existing legalFact*/
export const validDocIdxIdList: string[] = ["1"];

export const aValidFullReceivedNotification: FullReceivedNotification = {
  notificationStatus: "ACCEPTED",
  timeline: [
    {
      legalFactsIds: validLegalFactList
    }
  ],
  notificationStatusHistory: [],
  iun: validIunList[0],
  sentAt: new Date("2022-08-23T12:24:59.349Z"),
  documents: [
    {
      contentType: "contentType",
      digests: {
        sha256:
          "f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b"
      },
      ref: { key: "key", versionToken: "token" },
      docIdx: "1"
    }
  ],
  notificationFeePolicy: NotificationFeePolicyEnum.FLAT_RATE,
  paProtocolNumber: "1",
  physicalCommunicationType:
    PhysicalCommunicationTypeEnum.REGISTERED_LETTER_890,
  recipients: [],
  subject: "subject"
};

export const aValidNotificationAttachmentDownloadMetadataResponse: NotificationAttachmentDownloadMetadataResponse = {
  contentLength: 1,
  contentType: "content type",
  filename: "validName",
  url: `http://host.docker.internal:${process.env.SERVER_PORT}/download`,
  sha256: "f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b"
};

export const aValidLegalFactDownloadMetadataResponse: LegalFactDownloadMetadataResponse = {
  contentLength: 1,
  filename: "name.extension",
  url: `http://host.docker.internal:${process.env.SERVER_PORT}/download`
};

// ENV VARIABLES FOR THE TESTS
export const mockedConfig = {
  SERVER_PORT: "3004",
  COSMOSDB_URI: "http://example.com",
  COSMOSDB_KEY: "aKey",
  COSMOSDB_NAME: "aName",
  NODE_TLS_REJECT_UNAUTHORIZED: "0",
  IO_FUNCTION_SERVICES_BASE_URL: "aUrl",
  IO_FUNCTION_SERVICES_TOKEN: "aToken"
};
