import { Job, Workflow } from "../workflow";
import { parseUses } from "../workflowschema/uses";

function toArray(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input;
  }

  return [input];
}

export function normalizeWorkflow(filename: string, workflow: Workflow) {
  // Name
  workflow.name = workflow.name || filename;

  // On
  if (typeof workflow.on === "string") {
    workflow.on = {
      [workflow.on]: {},
    };
  } else if (Array.isArray(workflow.on)) {
    workflow.on = workflow.on.reduce((o, x) => {
      o[x] = {};
      return o;
    }, {});
  }

  // Jobs
  if (!workflow.jobs) {
    workflow.jobs = {};
  }

  for (const jobId of Object.keys(workflow.jobs)) {
    normalizeJob(workflow.jobs[jobId]);
  }
}

function normalizeJob(job: Job) {
  // Steps
  if (!Array.isArray(job.steps)) {
    job.steps = [];
  }

  job.steps = job.steps.filter((x) => typeof x === "object");

  for (const step of job.steps) {
    // Uses
    if (step && "uses" in step && typeof step.uses === "string") {
      step.uses = parseUses(step.uses);
    }
  }

  // Other properties
  job.needs = job.needs && toArray(job.needs);
  job["timeout-minutes"] = job["timeout-minutes"] || 360;
}
