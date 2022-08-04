import * as E from "fp-ts/lib/Either";

const mockUpsert = jest.fn().mockImplementation(() => {
  return Promise.resolve(E.right({ status: 200 }))
})

export const generateFunctionsServicesClient = jest.fn().mockImplementation(
  () => {
    return { upsertServiceActivation: mockUpsert }
  }
)
