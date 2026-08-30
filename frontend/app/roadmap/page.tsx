"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../components/app-shell";
import { DUMMY_USER_ID, getUserRoadmaps, toggleRoadmapTask } from "../../lib/api";

const tasksFallback = [
  { day: "Day 1", title: "Python fundamentals", status: "Completed" },
  { day: "Day 2", title: "Data cleaning and transformations", status: "In progress" },
  { day: "Day 3", title: "Visualization basics", status: "Planned" },
  { day: "Day 4", title: "Practice mini dataset challenge", status: "Planned" },
];

export default function RoadmapPage() {
  const [tasks, setTasks] = useState(tasksFallback);
  const [progress, setProgress] = useState("36% complete");

  useEffect(() => {
    let active = true;

    async function loadRoadmap() {
      try {
        const response = await getUserRoadmaps(DUMMY_USER_ID);
        if (!active) return;

        const roadmapTasks = response?.[0]?.tasks ?? [];
        if (roadmapTasks.length) {
          const mappedTasks = roadmapTasks.map((task) => ({
            day: `Day ${task.day_number}`,
            title: task.task_title,
            status: task.status === "Completed" ? "Completed" : task.status === "Pending" ? "Planned" : "In progress",
          }));

          setTasks(mappedTasks);
          setProgress(`${response[0].progress_percentage}% complete`);
          return;
        }
      } catch {}

      if (active) {
        setTasks(tasksFallback);
        setProgress("36% complete");
      }
    }

    loadRoadmap();
    return () => {
      active = false;
    };
  }, []);

  async function handleTaskToggle(taskTitle: string, status: string) {
    try {
      const roadmap = await getUserRoadmaps(DUMMY_USER_ID);
      const matchingTask = roadmap?.[0]?.tasks.find((item) => item.task_title === taskTitle);
      if (!matchingTask) return;

      const nextStatus = status === "Completed" ? "Pending" : "Completed";
      await toggleRoadmapTask(matchingTask.id, nextStatus);

      setTasks((prev) =>
        prev.map((task) =>
          task.title === taskTitle
            ? { ...task, status: nextStatus === "Completed" ? "Completed" : "Planned" }
            : task,
        ),
      );
    } catch {
      // keep the current UI if the backend is unavailable
    }
  }

  return (
    <AppShell title="Roadmap" subtitle="A personalized plan built from your skill gaps and recommended learning goals.">
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Weekly learning plan</h2>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {progress}
          </span>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={`${task.day}-${task.title}`} className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[#303030] p-4">
              <div>
                <div className="text-xs text-[var(--muted)]">{task.day}</div>
                <div className="mt-2 text-base font-medium text-white">{task.title}</div>
              </div>
              <button
                type="button"
                onClick={() => handleTaskToggle(task.title, task.status)}
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  task.status === "Completed"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : task.status === "In progress"
                      ? "bg-blue-500/10 text-blue-200"
                      : "bg-white/5 text-slate-300"
                }`}
              >
                {task.status}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
