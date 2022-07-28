const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  res.send(true);
});

const schema = Joi.object({
  email: Joi.string().required().min(5).max(255).email(),
  password: Joi.string().required().min(5).max(255),
});

const validate = (req) => schema.validate(req);

module.exports = router;
