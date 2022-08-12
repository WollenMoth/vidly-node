const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../index");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

describe("/api/genres", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);

      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a genre if valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const { _id, name } = genre;
      const res = await request(server).get(`/api/genres/${_id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name });
    });

    it("should return 400 if invalid id is passed", async () => {
      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if no genre with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();

      const res = await request(server).get(`/api/genres/${id}`);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const exec = () =>
      request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await exec();

      const genre = await Genre.find({ name: "genre1" });

      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    let id;
    let token;
    let name;

    const exec = () =>
      request(server)
        .put(`/api/genres/${id}`)
        .set("x-auth-token", token)
        .send({ name });

    beforeEach(async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      id = genre._id;
      token = new User().generateAuthToken();
      name = "genre2";
    });

    it("should return 400 if invalid id is passed", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no genre with the given id exists", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should update the genre if it is valid", async () => {
      await exec();

      const genre = await Genre.findById(id);

      expect(genre).not.toBeNull();
      expect(genre.name).toBe(name);
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", id.toHexString());
      expect(res.body).toHaveProperty("name", name);
    });
  });

  describe("DELETE /:id", () => {
    let id;
    let token;
    const name = "genre1";

    const exec = () =>
      request(server).delete(`/api/genres/${id}`).set("x-auth-token", token);

    beforeEach(async () => {
      const genre = new Genre({ name });
      await genre.save();

      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it("should return 400 if invalid id is passed", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if client is not admin", async () => {
      token = new User().generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 404 if no genre with the given id exists", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the genre if input is valid", async () => {
      await exec();

      genre = await Genre.findById(id);

      expect(genre).toBeNull();
    });

    it("should return the genre if input is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", id.toHexString());
      expect(res.body).toHaveProperty("name", name);
    });
  });
});
