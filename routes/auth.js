const Joi = require("joi");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { User } = require("../models/user");

const schema = Joi.object({
  email: Joi.string().required().min(5).max(255).email(),
  password: Joi.string().required().min(5).max(255),
});

const validator = (req) => schema.validate(req);

router.post("/", validate(validator), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send(token);
});

module.exports = router;
