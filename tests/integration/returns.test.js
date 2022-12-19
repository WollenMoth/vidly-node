const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../index");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");

describe("/api/returns", () => {
  let token;
  let payload;
  let rental;

  beforeEach(async () => {
    token = new User().generateAuthToken();

    const customerId = mongoose.Types.ObjectId();
    const movieId = mongoose.Types.ObjectId();

    payload = { customerId, movieId };

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "12345",
      },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
    });

    await rental.save();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  describe("POST /", () => {
    const exec = () =>
      request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send(payload);

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided", async () => {
      delete payload.customerId;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if movieId is not provided", async () => {
      delete payload.movieId;

      const res = await exec();

      expect(res.status).toBe(400);
    });
  });
});
