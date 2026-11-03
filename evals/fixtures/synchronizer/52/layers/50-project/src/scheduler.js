// Names of the jobs due when elapsedSeconds have passed since start.
export function dueJobs(jobs, elapsedSeconds) {
  return jobs.filter((job) => elapsedSeconds % job.intervalSeconds === 0).map((job) => job.name);
}
