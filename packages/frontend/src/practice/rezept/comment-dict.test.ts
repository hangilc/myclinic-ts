import { dateToCommentDate } from "./comment-dict";

describe("comment-record", () => {
  it("should format date", () => {
    expect(dateToCommentDate("2023-04-29")).equal("５０５０４２９")
  })
})
