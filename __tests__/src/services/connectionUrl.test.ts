
import { ConnectionUrl } from "../../../src/services/connectionUrl";

describe("sanitize", () => {
  it("without password", () => {
    expect(
      ConnectionUrl.sanitize("postgres://localhost:5432/postgres")
    ).toEqual("postgres://localhost:5432/postgres")
  })
})
