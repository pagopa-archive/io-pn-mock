import { FullReceivedNotification } from "../generated/FullReceivedNotification";
import {
  NotificationFeePolicyEnum,
  PhysicalCommunicationTypeEnum
} from "../generated/NewNotificationRequest";
import { NotificationAttachmentDownloadMetadataResponse } from "../generated/NotificationAttachmentDownloadMetadataResponse";
import { NotificationStatusEnum } from "../generated/NotificationStatus";
import { LegalFactDownloadMetadataResponse } from "../generated/LegalFactDownloadMetadataResponse";
import { LegalFactCategoryEnum } from "../generated/LegalFactCategory";

/**represent a list of existing iun*/
export const validIunList: string[] = ["validIun"];

/**represent a list of existing legalFact*/
export const validLegalFactList = [
  { category: LegalFactCategoryEnum.SENDER_ACK, key: "validLegalFactId" }
];

export const aValidFullReceivedNotification: FullReceivedNotification = {
  notificationStatus: NotificationStatusEnum.ACCEPTED,
  timeline: [
    {
      legalFactsIds: validLegalFactList
    }
  ],
  notificationStatusHistory: [],
  iun: validIunList[0],
  sentAt: new Date("2022-08-23T12:24:59.349Z"),
  documents: [],
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
  url: "/download",
  sha256: "f0e4c2f76c58916ec258f246851bea091d14d4247a2fc3e18694461b1816e13b"
};

export const aValidLegalFactDownloadMetadataResponse: LegalFactDownloadMetadataResponse = {
  contentLength: 1,
  filename: "name.extension",
  url: "/download"
};
