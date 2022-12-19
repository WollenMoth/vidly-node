const request = require("supertest");
const mongoose = require("mongoose");
const moment = require("moment");
const server = require("../../index");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { Movie } = require("../../models/movie");

describe("/api/returns", () => {
  let token;
  let movie;
  let payload;
  let rental;

  beforeEach(async () => {
    token = new User().generateAuthToken();

    movie = new Movie({
      title: "12345",
      genre: { name: "12345" },
      numberInStock: 10,
      dailyRentalRate: 2,
    });

    await movie.save();

    const customerId = mongoose.Types.ObjectId();

    payload = { customerId, movieId: movie._id };

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "12345",
      },
      movie,
    });

    await rental.save();
  });

  afterEach(async () => {
    await Rental.deleteMany({});
    await Movie.deleteMany({});
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

    it("should return 404 if no rental found for the customer/movie", async () => {
      await Rental.deleteMany({});

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if return is already processed", async () => {
      rental.dateReturned = new Date();
      await rental.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 200 if we have a valid request", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should set the return date if input is valid", async () => {
      await exec();

      const rentalInDb = await Rental.findById(rental._id);
      const diff = new Date() - rentalInDb.dateReturned;

      expect(diff).toBeLessThan(5 * 1000);
    });

    it("should set the rentalFee if input is valid", async () => {
      rental.dateOut = moment().add(-7, "days").toDate();
      await rental.save();

      await exec();

      const rentalInDb = await Rental.findById(rental._id);

      expect(rentalInDb.rentalFee).toBe(14);
    });

    it("should increase the movie stock if input is valid", async () => {
      await exec();

      const movieInDb = await Movie.findById(movie._id);

      expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it("should return the rental if input is valid", async () => {
      const res = await exec();

      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "dateOut",
          "dateReturned",
          "rentalFee",
          "customer",
          "movie",
        ])
      );
    });
  });
});
