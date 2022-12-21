const express = require("express");
const router = express.Router();
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Movie, validator } = require("../models/movie");
const { Genre } = require("../models/genre");

router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("name");

  res.send(movies);
});

router.post("/", [auth, validate(validator)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  const { _id, name } = genre;
  const movie = new Movie({ ...req.body, genre: { _id, name } });
  await movie.save();

  res.send(movie);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");

  res.send(movie);
});

router.put("/:id", [validateObjectId, auth, validate(validator)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  const { _id, name } = genre;
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { ...req.body, genre: { _id, name } },
    { new: true }
  );

  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");

  res.send(movie);
});

router.delete("/:id", [validateObjectId, auth], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");

  res.send(movie);
});

module.exports = router;
