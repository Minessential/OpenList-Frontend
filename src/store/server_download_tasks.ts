import { createSignal } from "solid-js"

const [serverDownloadTasksOpen, setServerDownloadTasksOpen] =
  createSignal(false)
const [highlightedServerDownloadTaskIds, setHighlightedServerDownloadTaskIds] =
  createSignal<string[]>([])

export const openServerDownloadTasks = (ids?: string[]) => {
  setServerDownloadTasksOpen(true)
  if (ids) {
    setHighlightedServerDownloadTaskIds(ids)
  }
}

export const closeServerDownloadTasks = () => {
  setServerDownloadTasksOpen(false)
  setHighlightedServerDownloadTaskIds([])
}

export { serverDownloadTasksOpen, highlightedServerDownloadTaskIds }
