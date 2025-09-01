import Queue from "bull";
import Story from "../models/Story.js";

const storyQueue = new Queue("storyQueue", {
    redis: { host: "127.0.0.1", port: 6379 }
});

// Add queue event listeners for debugging
storyQueue.on('waiting', (jobId) => {
    console.log(`⏳ Job ${jobId} is waiting to be processed`);
});

storyQueue.on('active', (job) => {
    console.log(`🔄 Job ${job.id} has started processing`);
});

storyQueue.on('stalled', (jobId) => {
    console.log(`⚠️ Job ${jobId} has stalled`);
});

// Process deletion jobs
storyQueue.process(async (job) => {
    const { storyId } = job.data;
    try {
        console.log(`🔄 Processing story deletion job for: ${storyId}`);
        const deletedStory = await Story.findByIdAndDelete(storyId);
        if (deletedStory) {
            console.log(`✅ Story ${storyId} deleted successfully after 24 hours`);
        } else {
            console.log(`⚠️ Story ${storyId} not found (may have been deleted already)`);
        }
    } catch (err) {
        console.error("❌ Error deleting story:", err.message);
    }
});

export default storyQueue;
