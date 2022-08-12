const request = require("supertest");
const server = require("../../index");

describe("/api/genres", () => {
  afterAll(async () => {
    server.close();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
    });
  });
});
