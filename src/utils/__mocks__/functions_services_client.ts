import * as E from "fp-ts/lib/Either";

const mockUpsert = jest.fn().mockImplementation(() => {
  console.log("mock2")
  return Promise.resolve(E.right({ status: 200 }))
})

export const generateFunctionsServicesClient = jest.fn().mockImplementation(
  () => {
    console.log("mock")
    return { upsertServiceActivation: mockUpsert }
  }
)
