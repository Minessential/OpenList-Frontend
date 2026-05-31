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
) => ({
  downloadedBytes:
    downloadedBytes ?? Math.round((Math.max(progress, 0) * totalBytes) / 100),
  totalBytes,
})

export const extractCreatedServerDownloadTaskIds = (
  data?: { task_ids?: string[] | null } | null,
) => data?.task_ids?.filter(Boolean) ?? []

export const canRetryServerDownloadTask = (state: number) => state === 7
