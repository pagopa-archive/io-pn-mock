import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";

export const findMock = jest.fn().mockImplementation(() => {
  return TE.of(O.some({ activationStatus: true }));
})

export const upsertMock = jest.fn().mockImplementation(({ activationStatus }: { activationStatus: boolean }) => {
  return TE.of({ activationStatus });
})

export const UserActivationDocument = jest.fn().mockImplementation(() => {
  return { find: findMock, upsert: upsertMock };
})
