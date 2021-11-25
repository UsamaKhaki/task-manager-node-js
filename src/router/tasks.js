const express = require("express");
const { isValidOperation, validateId } = require("../fn/functions");
const Tasks = require("../models/tasks");
const router = new express.Router();
const auth = require("./../middleware/auth");

// GET /tasks?completed=true;
// GET /tasks?limit=10&skip=0;
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    await req.user.populate({
      path: "tasks",
      match: match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort: sort,
      },
    });
    // const tasks = await Tasks.find({ owner: req.user._id });
    res.send(req.user.tasks);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.get("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;
  if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send("Invalid Task ID");
  }
  try {
    const task = await Tasks.findOne({ _id, owner: req.user._id });
    if (!task) {
      res.status(404).send("Task not found with given ID");
    }
    return res.status(200).send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.post("/tasks", auth, async (req, res) => {
  // Without Owner
  // const task = new Tasks(req.body);

  // With Owner
  const task = new Tasks({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    return res.status(200).send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).send("Invalid Task ID");
  }

  if (!isValidOperation(req.body, ["description", "completed"])) {
    return res.status(404).send({ error: "Invalid operations!!" });
  }

  try {
    // With middleware
    const updates = Object.keys(req.body);
    const task = await Tasks.findOne({ _id, owner: req.user._id });
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    // Without Middleware
    // const task = await Tasks.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    if (!task) {
      res.status(404).send("Task not found!!");
    }

    return res.send(task);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  if (!validateId(req.params.id)) {
    return res.status(404).send("Invalid Task ID");
  }
  try {
    const task = await Tasks.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send("Task not found!!");
    }

    return res.status(200).send("Task deleted successfully!!");
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
