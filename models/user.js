const Joi = require("joi");
const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1024,
    },
  })
);

const schema = Joi.object({
  name: Joi.string().required().min(5).max(50),
  email: Joi.string().required().min(5).max(255).email(),
  password: Joi.string().required().min(5).max(255),
});

const validate = (user) => schema.validate(user);

module.exports = { User, validate };
