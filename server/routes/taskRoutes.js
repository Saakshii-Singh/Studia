const express = require("express");
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middlewares/authMiddleware");

// All task routes require being logged in
router.use(protect);

router.route("/")
  .get(getTasks)
  .post(createTask);

router.route("/:id")
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;