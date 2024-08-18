const Bull = require('bull');
const { bikesSchema } = require('../Schema');

const jobQueue = new Bull('jobQueue', {
  redis: {
    port: 11411,
    host: 'redis-11411.c277.us-east-1-3.ec2.redns.redis-cloud.com',
    password: 'PgBUYi3mbJ0KN63JJ7hs4SoqevfPkqrw',
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
    const result = await bikesSchema.findOneAndUpdate(
      { JobId: job.data.JobId },
      { Status: 'Failed' },
      { new: true }
    );
  }
});

module.exports = jobQueue;
