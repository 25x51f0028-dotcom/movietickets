const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/tasks -> all tasks of the logged-in user
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(tasks);
});

// POST /api/tasks -> create a task
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, category } = req.body || {};
  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }
  const task = await Task.create({
    user: req.user._id,
    title,
    description: description || "",
    priority: priority || "medium",
    dueDate: dueDate || null,
    category: category || "General",
  });
  res.status(201).json(task);
});

// GET /api/tasks/:id -> one task
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  res.json(task);
});

// PUT /api/tasks/:id -> update a task
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  const { title, description, completed, priority, dueDate, category } = req.body || {};
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = completed;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (category !== undefined) task.category = category;

  const updatedTask = await task.save();
  res.json(updatedTask);
});

// DELETE /api/tasks/:id -> delete a task
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  await task.deleteOne();
  res.json({ message: "Task deleted", id: req.params.id });
});

// DELETE /api/tasks/completed/all -> delete all completed tasks of the user
const clearCompletedTasks = asyncHandler(async (req, res) => {
  await Task.deleteMany({ user: req.user._id, completed: true });
  res.json({ message: "All completed tasks cleared" });
});

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  clearCompletedTasks,
};
