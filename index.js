const mongoose = require("mongoose");
const express = require("express");
const genres = require("./routes/genres");

mongoose
  .connect("mongodb://localhost/vidly")
  .then(() => console.log("Connected to MongoDB..."))
  .catch(() => console.error("Could not connect to MongoDB..."));

const app = express();

app.use(express.json());
app.use("/api/genres", genres);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
