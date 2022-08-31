const mongoose = require("mongoose");
const server = require("../../index");
const { Rental } = require("../../models/rental");

describe("/api/returns", () => {
  let customerId;
  let movieId;
  let rental;

  beforeEach(async () => {
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();

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
});
