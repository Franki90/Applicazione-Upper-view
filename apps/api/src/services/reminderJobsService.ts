import cron from "node-cron";
import { env } from "../config/env";
import { runExpiringOfferReminderJob, runSubscriptionReminderJob } from "./notificationService";

export const runReminderJobsOnce = async () => {
  const [offersResult, subscriptionsResult] = await Promise.all([
    runExpiringOfferReminderJob(),
    runSubscriptionReminderJob()
  ]);

  return {
    offersResult,
    subscriptionsResult
  };
};

export const startReminderJobs = (): void => {
  if (!env.enableReminderJobs) {
    console.log("Reminder jobs disabled by ENABLE_REMINDER_JOBS=false");
    return;
  }

  cron.schedule(env.reminderCron, async () => {
    try {
      const result = await runReminderJobsOnce();
      console.log("Reminder jobs completed", result);
    } catch (error) {
      console.error("Reminder jobs failed", error);
    }
  });

  console.log(`Reminder jobs scheduled with cron: ${env.reminderCron}`);
};
