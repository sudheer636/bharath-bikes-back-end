const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/start-process", userController.startProcess);
router.get("/my-jobs", userController.getMyJobs);
router.get("/job-status/:jobId", userController.getJobStatus);

module.exports = router;
