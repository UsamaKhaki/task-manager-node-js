const express = require("express");
const { isValidOperation, validateId } = require("../fn/functions");
const auth = require("../middleware/auth");
const User = require("../models/users");
const router = new express.Router();
const multer = require("multer");
const Sharp = require("sharp");
const { sendWelcomeEmail } = require("../email/account");

router.post("/users", async (req, res) => {
  const { name } = req.body;
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    sendWelcomeEmail(user.email, user.name);
    return res.status(201).send({ user: user, token: token });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token != req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    return res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const allowedUpdateArr = ["name", "email", "password", "age"];

  if (!isValidOperation(req.body, allowedUpdateArr)) {
    return res.status(404).send({ error: "Invalid operations!!" });
  }

  try {
    // for middleware
    const user = req.user;
    const updates = Object.keys(req.body);
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    return res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //   return res.status(404).send("User Not found!!");
    // }

    await req.user.remove();
    res.status(200).send("User deleted successfully!!");
  } catch (e) {
    res.status(404).send(e);
  }
});

const upload = multer({
  // dest: "avatars", // for saving images in destinations
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("File must be image"));
    }
    return cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  upload.single("avatar"),
  auth,
  async (req, res) => {
    const buffer = await Sharp(req.file.buffer)
      .png()
      .resize(200, 200)
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send("Avatar Uploading successfully!!");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message, type: "File" });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send("Avatar deleted successfully!!");
});

router.get("/users/:id/avatar/:width?/:height?", async (req, res) => {
  if (!validateId(req.params.id)) {
    return res.status(404).send("Invalid User ID");
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    if (req.params.width) {
      const width = parseInt(req.params.width);
      const buffer = await Sharp(user.avatar)
        .png()
        .resize(width, req.params.height ? parseInt(req.params.height) : width)
        .toBuffer();
      return res.send(buffer);
    }
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
