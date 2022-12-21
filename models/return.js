const Joi = require("joi");
const mongoose = require("mongoose");
const { Customer } = require("./customer");
const { Movie } = require("./movie");

const Return = mongoose.model(
  "Return",
  new mongoose.Schema({
    customer: { type: Customer.schema, required: true },
    movie: { type: Movie.schema, required: true },
  })
);

const schema = Joi.object({
  customerId: Joi.objectId().required(),
  movieId: Joi.objectId().required(),
});

const validator = (r) => schema.validate(r);

module.exports = { Return, validator };
