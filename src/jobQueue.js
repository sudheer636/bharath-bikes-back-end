const Bull = require('bull');
require("dotenv").config();
const { bikesSchema } = require('../Schema');

const jobQueue = new Bull('jobQueue', {
  redis: {
    port: process.env.redisPort,
    host: process.env.redisHost,
    password: process.env.redisPassword,
  },
});

jobQueue.process(async (job) => {
  console.log('Processing job:', job.data.JobId);
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    await bikesSchema.findOneAndUpdate(
      { JobId: job.data.JobId },
      { Status: 'Completed' },
      { new: true }
    );
    await job.update({ progress: 100 });
    console.log('completed job:');
  } catch (error) {
    console.error('Error processing job:', job.data.JobId, error);
    await job.update({ failedReason: error.message });
    await bikesSchema.findOneAndUpdate(
      { JobId: job.data.JobId },
      { Status: 'Failed' },
      { new: true }
    );
  }
});

module.exports = jobQueue;
