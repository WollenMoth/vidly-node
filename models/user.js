const Joi = require("joi");
const _ = require("lodash");
const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    _.pick(this, ["_id", "isAdmin"]),
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

const schema = Joi.object({
  name: Joi.string().required().min(5).max(50),
  email: Joi.string().required().min(5).max(255).email(),
  password: Joi.string().required().min(5).max(255),
});

const validator = (user) => schema.validate(user);

module.exports = { User, validator };
