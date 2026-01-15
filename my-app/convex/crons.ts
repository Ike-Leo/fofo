import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run activity log cleanup every day at midnight
crons.daily(
    "Usage cleanup",
    { hourUTC: 0, minuteUTC: 0 },
    internal.productActivities.cleanupOldActivities
);

export default crons;
