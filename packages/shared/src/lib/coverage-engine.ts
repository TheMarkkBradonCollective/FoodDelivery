import type { CoverageInterval, CoverageRule, CoverageStatus, Run } from "../types/index";
import { minutesToTime, timeToMinutes } from "./utils";

const INTERVAL_MINUTES = 30;

export function getCoverageStatus(
  maxRunrs: number,
  scheduledRunrs: number
): { status: CoverageStatus; gap: number } {
  if (scheduledRunrs >= maxRunrs) {
    return { status: "full", gap: 0 };
  }
  const gap = maxRunrs - scheduledRunrs;
  if (gap >= 2) {
    return { status: "gap", gap };
  }
  return { status: "low", gap };
}

function runsOverlapRun(
  runStart: number,
  runEnd: number,
  intervalStart: number,
  intervalEnd: number
): boolean {
  return runStart < intervalEnd && runEnd > intervalStart;
}

function countScheduledRunrsForInterval(
  intervalStart: number,
  intervalEnd: number,
  runs: Run[]
): number {
  return runs.filter((run) => {
    const runStart = timeToMinutes(run.startTime);
    const runEnd = timeToMinutes(run.endTime);
    return runsOverlapRun(runStart, runEnd, intervalStart, intervalEnd);
  }).length;
}

function getMaxRunrsForInterval(
  intervalStart: number,
  intervalEnd: number,
  rules: CoverageRule[]
): number {
  let max = 0;
  for (const rule of rules) {
    const ruleStart = timeToMinutes(rule.startTime);
    const ruleEnd = timeToMinutes(rule.endTime);
    if (runsOverlapRun(ruleStart, ruleEnd, intervalStart, intervalEnd)) {
      max = Math.max(max, rule.maxRunrs);
    }
  }
  return max;
}

export function calculateCoverageTimeline(
  rules: CoverageRule[],
  runs: Run[],
  dayStart = "10:00",
  dayEnd = "23:00"
): CoverageInterval[] {
  const start = timeToMinutes(dayStart);
  const end = timeToMinutes(dayEnd);
  const intervals: CoverageInterval[] = [];

  for (let t = start; t < end; t += INTERVAL_MINUTES) {
    const intervalEnd = Math.min(t + INTERVAL_MINUTES, end);
    const maxRunrs = getMaxRunrsForInterval(t, intervalEnd, rules);
    if (maxRunrs === 0) continue;

    const scheduledRunrs = countScheduledRunrsForInterval(t, intervalEnd, runs);
    const { status, gap } = getCoverageStatus(maxRunrs, scheduledRunrs);

    intervals.push({
      startTime: minutesToTime(t),
      endTime: minutesToTime(intervalEnd),
      maxRunrs,
      scheduledRunrs,
      status,
      gap,
    });
  }

  return intervals;
}

export function canScheduleRun(
  startTime: string,
  endTime: string,
  rules: CoverageRule[],
  runs: Run[],
  excludeRunId?: string
): { available: boolean; blockingIntervals: CoverageInterval[] } {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end <= start) {
    return { available: false, blockingIntervals: [] };
  }

  const filteredRuns = excludeRunId
    ? runs.filter((r) => r.id !== excludeRunId)
    : runs;

  const blockingIntervals: CoverageInterval[] = [];

  for (let t = start; t < end; t += INTERVAL_MINUTES) {
    const intervalEnd = Math.min(t + INTERVAL_MINUTES, end);
    const maxRunrs = getMaxRunrsForInterval(t, intervalEnd, rules);
    if (maxRunrs === 0) continue;

    const scheduledRunrs = countScheduledRunrsForInterval(
      t,
      intervalEnd,
      filteredRuns
    );

    if (scheduledRunrs >= maxRunrs) {
      const { gap } = getCoverageStatus(maxRunrs, scheduledRunrs);
      blockingIntervals.push({
        startTime: minutesToTime(t),
        endTime: minutesToTime(intervalEnd),
        maxRunrs,
        scheduledRunrs,
        status: "over_capacity",
        gap,
      });
    }
  }

  return {
    available: blockingIntervals.length === 0,
    blockingIntervals,
  };
}

export function getBusinessCoverageSummary(
  rules: CoverageRule[],
  runs: Run[],
  atTime?: string
): { maxRunrs: number; scheduledRunrs: number; status: CoverageStatus; gap: number } {
  const now = atTime ?? minutesToTime(new Date().getHours() * 60 + new Date().getMinutes());
  const t = timeToMinutes(now);
  const intervalEnd = t + INTERVAL_MINUTES;

  const maxRunrs = getMaxRunrsForInterval(t, intervalEnd, rules);
  const scheduledRunrs = countScheduledRunrsForInterval(t, intervalEnd, runs);
  const { status, gap } = getCoverageStatus(maxRunrs, scheduledRunrs);

  return { maxRunrs, scheduledRunrs, status, gap };
}

export function getMarkerColor(status: CoverageStatus, demandHigh?: boolean): string {
  if (demandHigh && status !== "full") return "#FF4F00";
  switch (status) {
    case "full":
      return "#22C55E";
    case "low":
      return "#F97316";
    case "gap":
      return "#EF4444";
    default:
      return "#71717A";
  }
}
