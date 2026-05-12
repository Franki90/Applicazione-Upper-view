import { app } from "./app";
import { env } from "./config/env";
import { startReminderJobs } from "./services/reminderJobsService";

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
  startReminderJobs();
});
