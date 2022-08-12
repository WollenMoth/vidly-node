const Joi = require("joi");
const mongoose = require("mongoose");

const Genre = mongoose.model(
  "Genre",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
  })
);

const schema = Joi.object({
  name: Joi.string().min(5).max(50).required(),
});

const validate = (genre) => schema.validate(genre);

module.exports = { Genre, validate };
