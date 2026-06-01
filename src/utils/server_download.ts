import type { TaskInfo } from "~/types"

type ServerDownloadTaskStatus = Pick<TaskInfo, "state"> &
  Pick<Partial<TaskInfo>, "paused" | "resumable">

const ServerDownloadTaskState = {
  Pending: 0,
  Running: 1,
  Errored: 5,
  Failing: 6,
  Failed: 7,
  WaitingRetry: 8,
  BeforeRetry: 9,
}

export const canShowServerDownloadAction = (
  hasPermission: boolean,
  selected: Array<{ is_dir: boolean }>,
) => hasPermission && selected.length > 0

export const hasServerDownloadDirectories = (
  selected: Array<{ is_dir: boolean }>,
) => selected.some((item) => item.is_dir)

export const deriveServerDownloadProgressBytes = (
  progress: number,
  totalBytes: number,
  downloadedBytes?: number,
  resumeOffset?: number,
) => ({
  downloadedBytes:
    downloadedBytes ??
    resumeOffset ??
    Math.round((Math.max(progress, 0) * totalBytes) / 100),
  totalBytes,
})

export const extractCreatedServerDownloadTaskIds = (
  data?: { task_ids?: string[] | null } | null,
) => data?.task_ids?.filter(Boolean) ?? []

export const canRetryServerDownloadTask = (state: number) => state === 7

export const canPauseServerDownloadTask = (task: ServerDownloadTaskStatus) =>
  !task.paused &&
  (task.state === ServerDownloadTaskState.Pending ||
    task.state === ServerDownloadTaskState.Running ||
    task.state === ServerDownloadTaskState.WaitingRetry ||
    task.state === ServerDownloadTaskState.BeforeRetry)

export const canResumeServerDownloadTask = (task: ServerDownloadTaskStatus) =>
  Boolean(task.resumable) &&
  (Boolean(task.paused) ||
    task.state === ServerDownloadTaskState.Errored ||
    task.state === ServerDownloadTaskState.Failing ||
    task.state === ServerDownloadTaskState.Failed)

export const getServerDownloadStateText = (task: ServerDownloadTaskStatus) =>
  task.paused ? "tasks.paused" : `tasks.state.${task.state}`
