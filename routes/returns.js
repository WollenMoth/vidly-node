const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const { validate } = require("../models/return");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findOne({
    "customer._id": req.body.customerId,
    "movie._id": req.body.movieId,
  });
  if (!rental) return res.status(404).send("Rental not found.");

  if (rental.dateReturned)
    return res.status(400).send("Return already processed.");

  rental.dateReturned = new Date();
  rental.rentalFee = rental.calculateRentalFee();
  await rental.save();

  await Movie.updateOne(
    { _id: rental.movie._id },
    { $inc: { numberInStock: 1 } }
  );

  res.send(rental);
});

module.exports = router;
