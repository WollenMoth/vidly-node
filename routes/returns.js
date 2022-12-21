const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { validator } = require("../models/return");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");

router.post("/", [auth, validate(validator)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
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
