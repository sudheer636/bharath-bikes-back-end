const { v4: uuid } = require("uuid");
require("dotenv").config();
const verifyToken = require("../../auth-token");
const jobQueue = require("../jobQueue");
const { bikesSchema, userSchema } = require("../../Schema");
const {LRUCache} = require("lru-cache");

const userCache = new LRUCache({ max: 100, maxAge: 1000 * 60 * 60 });

exports.startProcess = [
  verifyToken,
  async (req, res) => {
    try {
      const UserId = req.body?.UserId || req.UserId
      const duration = 10000 ||req.body?.duration || 5000;
      const allActiveJobs = await jobQueue.getJobs(['waiting', 'active']);
      const activeJobsForUser = allActiveJobs.filter(job => job.JobId === UserId);
      if (activeJobsForUser.length > 0) {
        return res.status(429).json({ message: 'A process is already in progress.' });
      }
      const JobId = uuid().replace(/-/g, "");

      await new bikesSchema({
        JobId,
        UserId,
        Bikename: req.body?.Bikename || req.selectedBike,
      }).save();

      console.log('Job added to queue:', JobId);
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

async function populateUserCache() {
  if (userCache.size > 0) {
    return;
  }

  try {
    const users = await userSchema.find({}, 'Username UserId -_id');
    users.forEach(user => {
      userCache.set(user.UserId, user.Username);
    });
  } catch (error) {
    console.error('Failed to populate user cache:', error);
  }
}

module.exports.addToCache = (userId, username) => {
  userCache.set(userId, username);
};

async function getUsernameFromCache(userId) {
  let username = userCache.get(userId);
  if (!username) {
    const user = await userSchema.findOne({ UserId: userId }, 'Username -_id');
    if (user) {
      username = user.Username;
      userCache.set(userId, username);
    }
  }
  return username;
}

exports.getMyJobs = [
  verifyToken,
  async (req, res) => {
    try {
      await populateUserCache();

      const UserId = req.body && req.body.UserId || req.UserId;
      const query = UserId === 'adminUser' ? {} : { UserId };
      const jobs = await bikesSchema.find(query);

      const jobsWithUsernames = await Promise.all(jobs.map(async (job) => {
        const username = await getUsernameFromCache(job.UserId);
        return { ...job.toObject(), username };
      }));

      return res.status(200).json(jobsWithUsernames);
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

exports.getUserDetails = [
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
