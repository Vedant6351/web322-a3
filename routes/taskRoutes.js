const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// -------------------- DASHBOARD --------------------
router.get("/dashboard", async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.session.user.id }
    });

    res.render("tasks/dashboard", {
      user: req.session.user,
      taskCount: tasks.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// -------------------- VIEW ALL TASKS --------------------
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.session.user.id }
    });

    res.render("tasks/list", {
      user: req.session.user,
      tasks
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// -------------------- ADD TASK (GET) --------------------
router.get("/tasks/add", (req, res) => {
  res.render("tasks/add", { user: req.session.user, error: null });
});

// -------------------- ADD TASK (POST) --------------------
router.post("/tasks/add", async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.render("tasks/add", { error: "Title is required.", user: req.session.user });
    }

    await Task.create({
      title,
      description,
      dueDate: dueDate || null,
      status: "pending",
      userId: req.session.user.id
    });

    res.redirect("/tasks");
  } catch (err) {
    console.error(err);
    res.render("tasks/add", { error: "Could not create task", user: req.session.user });
  }
});

// -------------------- EDIT TASK (GET) --------------------
router.get("/tasks/edit/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id
      }
    });

    if (!task) return res.redirect("/tasks");

    res.render("tasks/edit", { user: req.session.user, task, error: null });

  } catch (err) {
    console.error(err);
    res.redirect("/tasks");
  }
});

// -------------------- EDIT TASK (POST) --------------------
router.post("/tasks/edit/:id", async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    await Task.update(
      { title, description, dueDate, status },
      {
        where: {
          id: req.params.id,
          userId: req.session.user.id
        }
      }
    );

    res.redirect("/tasks");

  } catch (err) {
    console.error(err);
    res.redirect("/tasks");
  }
});

// -------------------- DELETE TASK --------------------
router.post("/tasks/delete/:id", async (req, res) => {
  try {
    await Task.destroy({
      where: {
        id: req.params.id,
        userId: req.session.user.id
      }
    });

    res.redirect("/tasks");

  } catch (err) {
    console.error(err);
    res.redirect("/tasks");
  }
});

// -------------------- UPDATE STATUS --------------------
router.post("/tasks/status/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id
      }
    });

    if (!task) return res.redirect("/tasks");

    const newStatus = task.status === "pending" ? "completed" : "pending";

    await Task.update(
      { status: newStatus },
      { where: { id: task.id } }
    );

    res.redirect("/tasks");

  } catch (err) {
    console.error(err);
    res.redirect("/tasks");
  }
});

module.exports = router;
