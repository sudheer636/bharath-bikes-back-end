const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const verifyToken = require("../../auth-token");
const jobQueue = require("../jobQueue");
const { bikesSchema } = require("../../Schema");

exports.startProcess = [
  verifyToken,
  async (req, res) => {
    try {
      const duration = req.body?.duration || 5000;
      const activeJobs = await jobQueue.getJobs(['waiting', 'active']);
      if (activeJobs.length > 0) {
        return res.status(429).json({ message: 'A process is already in progress.' });
      }
      const JobId = uuid().replace(/-/g, "");

      await new bikesSchema({
        JobId,
        UserId: req.body?.UserId || req.UserId,
        Bikename: req.body?.Bikename || req.selectedBike,
      }).save();

      await jobQueue.add({
        JobId,
        UserId: req.body?.UserId || req.UserId,
        Bikename: req.body?.Bikename || req.selectedBike},
        {
          delay: duration,
      });

      res.status(200).json({ message: 'Process started successfully', JobId });
    } catch (err) {
      console.log(err, 'error');
      res.status(400).json({ message: 'Unable to start process' });
    }
  }
];

exports.getMyJobs = [
  verifyToken,
  async (req, res) => {
    try {
      const UserId = req.body && req.body.UserId || req.UserId;
      const query = UserId === 'adminUser' ? {} : { UserId };
      const jobs = await bikesSchema.find(query);
      return res.status(200).json(jobs);
    } catch (err) {
      console.error("Error fetching user jobs:", err);
      return res.status(400).json({ message: err.message });
    }
  }
];

exports.getJobStatus = [
  verifyToken,
  async (req, res) => {
    try {
      const job = await bikesSchema.findOne({ JobId: req.params.jobId });
      if (job) {
        res.status(200).json({ status: job.Status });
      } else {
        res.status(404).json({ message: 'Job not found' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving job status' });
    }
  }
];
