import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  ProgressIndicator,
  Spinner,
  Text,
  VStack,
} from "@hope-ui/solid"
import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js"
import { useFetch, useT } from "~/hooks"
import {
  closeServerDownloadTasks,
  highlightedServerDownloadTaskIds,
  me,
  serverDownloadTasksOpen,
} from "~/store"
import {
  PEmptyResp,
  PResp,
  TaskInfo,
  TaskStateEnum,
  UserMethods,
} from "~/types"
import {
  canPauseServerDownloadTask,
  canRetryServerDownloadTask,
  canResumeServerDownloadTask,
  compareServerDownloadTasksStable,
  deriveServerDownloadProgressBytes,
  getFileSize,
  getServerDownloadStateText,
  handleResp,
  handleRespWithoutNotify,
  notify,
  r,
} from "~/utils"

type TaskWithView = TaskInfo & {
  curFetchTime: number
  prevFetchTime?: number
  prevProgress?: number
}

const getTaskStateColor = (task: TaskInfo) => {
  if (task.paused) return "warning"
  switch (task.state) {
    case TaskStateEnum.Succeeded:
      return "success"
    case TaskStateEnum.Failed:
      return "danger"
    case TaskStateEnum.Canceled:
      return "neutral"
    default:
      return "info"
  }
}

const getTaskErrorText = (task: TaskInfo) => task.error || task.status || "-"

const TaskItem = (props: {
  task: TaskWithView
  highlighted: boolean
  selected: boolean
  showCreator: boolean
  onSelect: (selected: boolean) => void
  onRetried: () => void
}) => {
  const t = useT()
  const taskTitle = createMemo(() => {
    if (props.task.src_path) {
      const parts = props.task.src_path.split("/")
      return parts[parts.length - 1] || "/"
    }
    return props.task.name
  })
  const srcPath = createMemo(() => props.task.src_path || props.task.name)
  const dstPath = createMemo(() => props.task.dst_local_path || "-")
  const progressBytes = createMemo(() =>
    deriveServerDownloadProgressBytes(
      props.task.progress,
      props.task.total_bytes,
      props.task.downloaded_bytes,
      props.task.resume_offset,
    ),
  )
  const [retryLoading, retry] = useFetch(
    (): PEmptyResp =>
      r.post(`/task/server_download/retry?tid=${props.task.id}`),
  )
  const [pauseLoading, pause] = useFetch(
    (): PEmptyResp =>
      r.post(`/task/server_download/pause?tid=${props.task.id}`),
  )
  const [resumeLoading, resume] = useFetch(
    (): PEmptyResp =>
      r.post(`/task/server_download/resume?tid=${props.task.id}`),
  )

  return (
    <VStack
      alignItems="start"
      spacing="$2"
      w="$full"
      p="$3"
      rounded="$lg"
      border="1px solid"
      borderColor={props.highlighted ? "$success7" : "$neutral5"}
      bgColor={props.highlighted ? "$success1" : "$neutral1"}
      shadow={props.highlighted ? "$md" : "none"}
    >
      <HStack w="$full" justifyContent="space-between" alignItems="start">
        <HStack alignItems="start" spacing="$2" minW="0">
          <Checkbox
            checked={props.selected}
            onChange={(e: any) => props.onSelect(e.currentTarget.checked)}
          />
          <VStack alignItems="start" spacing="$1" minW="0">
            <Text fontWeight="$semibold" css={{ wordBreak: "break-all" }}>
              {taskTitle()}
            </Text>
            <Show when={props.showCreator}>
              <Text fontSize="$xs" color="$info10">
                {props.task.creator}
              </Text>
            </Show>
            <Text
              fontSize="$xs"
              color="$neutral10"
              css={{ wordBreak: "break-all" }}
            >
              {srcPath()}
            </Text>
            <Text
              fontSize="$xs"
              color="$neutral10"
              css={{ wordBreak: "break-all" }}
            >
              {dstPath()}
            </Text>
          </VStack>
        </HStack>
        <Badge colorScheme={getTaskStateColor(props.task) as any}>
          {t(getServerDownloadStateText(props.task))}
        </Badge>
      </HStack>
      <Progress w="$full" value={props.task.progress} rounded="$full" size="sm">
        <ProgressIndicator color="$info8" rounded="$md" />
      </Progress>
      <Text fontSize="$xs" color="$neutral10">
        {getFileSize(progressBytes().downloadedBytes)} /{" "}
        {getFileSize(progressBytes().totalBytes)}
      </Text>
      <Show when={props.task.resume_offset !== undefined}>
        <Text fontSize="$xs" color="$neutral10">
          {t("tasks.attr.server_download.resume_offset")}:{" "}
          {getFileSize(props.task.resume_offset ?? 0)}
        </Text>
      </Show>
      <Show when={props.task.partial_local_path}>
        <Text
          fontSize="$xs"
          color="$neutral10"
          css={{ wordBreak: "break-all" }}
        >
          {t("tasks.attr.server_download.partial_local_path")}:{" "}
          {props.task.partial_local_path}
        </Text>
      </Show>
      <Text fontSize="$sm" color="$neutral11">
        {props.task.status || "-"}
      </Text>
      <Show when={props.task.error || props.task.failed_reason}>
        <Text fontSize="$sm" color="$danger9">
          {props.task.failed_reason || getTaskErrorText(props.task)}
        </Text>
      </Show>
      <HStack spacing="$2" flexWrap="wrap">
        <Show when={canPauseServerDownloadTask(props.task)}>
          <Button
            size="sm"
            colorScheme="warning"
            loading={pauseLoading()}
            onClick={async () => {
              const resp = await pause()
              handleResp(resp, props.onRetried)
            }}
          >
            {t("tasks.pause")}
          </Button>
        </Show>
        <Show when={canResumeServerDownloadTask(props.task)}>
          <Button
            size="sm"
            colorScheme="success"
            loading={resumeLoading()}
            onClick={async () => {
              const resp = await resume()
              handleResp(resp, props.onRetried)
            }}
          >
            {t("tasks.resume")}
          </Button>
        </Show>
        <Show
          when={
            canRetryServerDownloadTask(props.task.state) &&
            !canResumeServerDownloadTask(props.task)
          }
        >
          <Button
            size="sm"
            loading={retryLoading()}
            onClick={async () => {
              const resp = await retry()
              handleResp(resp, props.onRetried)
            }}
          >
            {t("tasks.retry")}
          </Button>
        </Show>
      </HStack>
    </VStack>
  )
}

export const ServerDownloadTasks = () => {
  const t = useT()
  const [showOnlyMine, setShowOnlyMine] = createSignal(
    !UserMethods.is_admin(me()),
  )
  const [loadingUndone, getUndone] = useFetch(
    (): PResp<TaskInfo[]> => r.get("/task/server_download/undone"),
  )
  const [loadingDone, getDone] = useFetch(
    (): PResp<TaskInfo[]> => r.get("/task/server_download/done"),
  )
  const [retryFailedLoading, retryFailed] = useFetch(
    (): PEmptyResp => r.post("/task/server_download/retry_failed"),
  )
  const [deleteSelectedLoading, deleteSelected] = useFetch(
    (ids: string[], deleteFiles: boolean): PResp<Record<string, string>> =>
      r.post("/task/server_download/delete_with_files", {
        ids,
        delete_files: deleteFiles,
      }),
  )
  const [undoneTasks, setUndoneTasks] = createSignal<TaskWithView[]>([])
  const [doneTasks, setDoneTasks] = createSignal<TaskWithView[]>([])
  const [selectedTaskIds, setSelectedTaskIds] = createSignal<string[]>([])
  const [deleteConfirmOpen, setDeleteConfirmOpen] = createSignal(false)
  const [deleteTaskFiles, setDeleteTaskFiles] = createSignal(false)

  const mergeTaskView = (
    previous: TaskWithView[],
    next: TaskInfo[],
  ): TaskWithView[] => {
    const fetchTime = Date.now()
    const previousById = new Map(previous.map((item) => [item.id, item]))
    return next
      .map((task) => {
        const prev = previousById.get(task.id)
        const progressChanged = prev && prev.progress !== task.progress
        return {
          ...task,
          curFetchTime: fetchTime,
          prevFetchTime: progressChanged
            ? prev?.curFetchTime
            : prev?.prevFetchTime,
          prevProgress: progressChanged ? prev?.progress : prev?.prevProgress,
        }
      })
      .sort(compareServerDownloadTasksStable)
  }

  const applyUndone = (data?: TaskInfo[]) => {
    setUndoneTasks((prev) => mergeTaskView(prev, data ?? []))
  }

  const applyDone = (data?: TaskInfo[]) => {
    setDoneTasks((prev) => mergeTaskView(prev, data ?? []))
  }

  const refreshUndone = async (silent = false) => {
    const resp = silent
      ? await (r.get("/task/server_download/undone") as PResp<TaskInfo[]>)
      : await getUndone()
    const handle = silent ? handleRespWithoutNotify : handleResp
    handle(resp, applyUndone)
  }

  const refreshDone = async (silent = false) => {
    const resp = silent
      ? await (r.get("/task/server_download/done") as PResp<TaskInfo[]>)
      : await getDone()
    const handle = silent ? handleRespWithoutNotify : handleResp
    handle(resp, applyDone)
  }

  const refreshAll = async (silent = false) => {
    await Promise.all([refreshUndone(silent), refreshDone(silent)])
  }

  createEffect(() => {
    if (!serverDownloadTasksOpen()) return
    void refreshAll()
  })

  createEffect(() => {
    if (!serverDownloadTasksOpen()) return
    const delay = undoneTasks().length > 0 ? 2000 : 10000
    const interval = setInterval(() => {
      void refreshAll(true)
    }, delay)
    onCleanup(() => clearInterval(interval))
  })

  const hasFailedTasks = createMemo(() =>
    doneTasks().some((task) => canRetryServerDownloadTask(task.state)),
  )
  const visibleUndoneTasks = createMemo(() =>
    undoneTasks().filter((task) =>
      showOnlyMine() ? task.creator === me().username : true,
    ),
  )
  const visibleDoneTasks = createMemo(() =>
    doneTasks().filter((task) =>
      showOnlyMine() ? task.creator === me().username : true,
    ),
  )
  const visibleTasks = createMemo(() => [
    ...visibleUndoneTasks(),
    ...visibleDoneTasks(),
  ])
  const visibleTaskIds = createMemo(() => visibleTasks().map((task) => task.id))
  const selectedVisibleIds = createMemo(() =>
    selectedTaskIds().filter((id) => visibleTaskIds().includes(id)),
  )
  const selectedVisibleTaskIds = createMemo(() => {
    const selected = new Set(selectedTaskIds())
    return visibleTasks()
      .filter((task) => selected.has(task.id))
      .map((task) => task.id)
  })
  const selectedSucceededTaskIds = createMemo(() => {
    const selected = new Set(selectedTaskIds())
    return visibleTasks()
      .filter(
        (task) =>
          selected.has(task.id) && task.state === TaskStateEnum.Succeeded,
      )
      .map((task) => task.id)
  })
  const allVisibleSelected = createMemo(
    () =>
      visibleTaskIds().length > 0 &&
      visibleTaskIds().every((id) => selectedTaskIds().includes(id)),
  )
  const isIndeterminate = createMemo(
    () => selectedVisibleIds().length > 0 && !allVisibleSelected(),
  )
  const showCreator = createMemo(
    () => UserMethods.is_admin(me()) && !showOnlyMine(),
  )
  const toggleTaskSelected = (id: string, selected: boolean) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (selected) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return [...next]
    })
  }
  const toggleVisibleSelected = (selected: boolean) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      visibleTaskIds().forEach((id) => {
        if (selected) {
          next.add(id)
        } else {
          next.delete(id)
        }
      })
      return [...next]
    })
  }
  const notifyIndividualError = (msg: Record<string, string>) => {
    Object.entries(msg).forEach(([key, value]) => {
      notify.error(`${key}: ${value}`)
    })
  }
  const clearSucceededSelected = (
    ids: string[],
    errors: Record<string, string>,
  ) => {
    const succeeded = new Set(ids.filter((id) => !errors[id]))
    setSelectedTaskIds((prev) => prev.filter((id) => !succeeded.has(id)))
  }
  const handleDeleteSelected = async () => {
    const ids = selectedVisibleTaskIds()
    if (ids.length === 0) return
    const resp = await deleteSelected(ids, deleteTaskFiles())
    handleResp(resp, (data) => {
      notifyIndividualError(data)
      clearSucceededSelected(ids, data)
      setDeleteConfirmOpen(false)
      setDeleteTaskFiles(false)
      void refreshAll(true)
    })
  }
  const handleDeleteClick = () => {
    if (selectedSucceededTaskIds().length > 0) {
      setDeleteConfirmOpen(true)
      return
    }
    setDeleteTaskFiles(false)
    void handleDeleteSelected()
  }

  return (
    <Drawer
      opened={serverDownloadTasksOpen()}
      placement="right"
      onClose={closeServerDownloadTasks}
      size={{ "@initial": "full", "@md": "md" }}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader color="$info9">
          {t("home.toolbar.server_download_tasks")}
        </DrawerHeader>
        <DrawerBody>
          <VStack alignItems="start" spacing="$4" w="$full">
            <Flex
              w="$full"
              gap="$2"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
            >
              <Text fontSize="$sm" color="$neutral10">
                {t("home.toolbar.server_download_recent_created")}
              </Text>
              <HStack spacing="$2" flexWrap="wrap">
                <Button
                  size="sm"
                  colorScheme="neutral"
                  loading={loadingUndone() || loadingDone()}
                  onClick={() => void refreshAll()}
                >
                  {t("global.refresh")}
                </Button>
                <Button
                  size="sm"
                  colorScheme="danger"
                  loading={deleteSelectedLoading()}
                  disabled={selectedVisibleTaskIds().length === 0}
                  onClick={handleDeleteClick}
                >
                  {t("tasks.delete_selected")}
                </Button>
                <Show when={hasFailedTasks()}>
                  <Button
                    size="sm"
                    loading={retryFailedLoading()}
                    onClick={async () => {
                      const resp = await retryFailed()
                      handleResp(resp, () => void refreshAll())
                    }}
                  >
                    {t("tasks.retry_failed")}
                  </Button>
                </Show>
              </HStack>
            </Flex>

            <HStack spacing="$3" flexWrap="wrap">
              <Checkbox
                checked={allVisibleSelected()}
                indeterminate={isIndeterminate()}
                disabled={visibleTaskIds().length === 0}
                onChange={(e: any) =>
                  toggleVisibleSelected(Boolean(e.currentTarget.checked))
                }
              >
                {t("global.select_all")}
              </Checkbox>
              <Show when={UserMethods.is_admin(me())}>
                <Checkbox
                  checked={showOnlyMine()}
                  onChange={(e: any) =>
                    setShowOnlyMine(Boolean(e.currentTarget.checked))
                  }
                >
                  {t("tasks.show_only_mine")}
                </Checkbox>
              </Show>
            </HStack>

            <VStack alignItems="start" spacing="$2" w="$full">
              <HStack justifyContent="space-between" w="$full">
                <Text fontWeight="$semibold">
                  {t("home.toolbar.server_download_running")}
                </Text>
                <Show when={loadingUndone()}>
                  <Spinner size="sm" />
                </Show>
              </HStack>
              <Show
                when={visibleUndoneTasks().length > 0}
                fallback={<Text color="$neutral10">-</Text>}
              >
                <For each={visibleUndoneTasks()}>
                  {(task) => (
                    <TaskItem
                      task={task}
                      showCreator={showCreator()}
                      selected={selectedTaskIds().includes(task.id)}
                      onSelect={(selected) =>
                        toggleTaskSelected(task.id, selected)
                      }
                      highlighted={highlightedServerDownloadTaskIds().includes(
                        task.id,
                      )}
                      onRetried={() => void refreshAll()}
                    />
                  )}
                </For>
              </Show>
            </VStack>

            <Divider />

            <VStack alignItems="start" spacing="$2" w="$full">
              <HStack justifyContent="space-between" w="$full">
                <Text fontWeight="$semibold">
                  {t("home.toolbar.server_download_done")}
                </Text>
                <Show when={loadingDone()}>
                  <Spinner size="sm" />
                </Show>
              </HStack>
              <Show
                when={visibleDoneTasks().length > 0}
                fallback={<Text color="$neutral10">-</Text>}
              >
                <For each={visibleDoneTasks()}>
                  {(task) => (
                    <TaskItem
                      task={task}
                      showCreator={showCreator()}
                      selected={selectedTaskIds().includes(task.id)}
                      onSelect={(selected) =>
                        toggleTaskSelected(task.id, selected)
                      }
                      highlighted={highlightedServerDownloadTaskIds().includes(
                        task.id,
                      )}
                      onRetried={() => void refreshAll()}
                    />
                  )}
                </For>
              </Show>
            </VStack>
          </VStack>
        </DrawerBody>
      </DrawerContent>
      <Modal
        opened={deleteConfirmOpen()}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("tasks.delete_selected")}</ModalHeader>
          <ModalBody>
            <VStack alignItems="start" spacing="$3">
              <Text>
                {t("tasks.delete_server_download_confirm", {
                  count: selectedVisibleTaskIds().length,
                  completed: selectedSucceededTaskIds().length,
                })}
              </Text>
              <Checkbox
                checked={deleteTaskFiles()}
                onChange={(e: any) =>
                  setDeleteTaskFiles(Boolean(e.currentTarget.checked))
                }
              >
                {t("tasks.delete_server_download_files")}
              </Checkbox>
            </VStack>
          </ModalBody>
          <ModalFooter display="flex" gap="$2">
            <Button
              colorScheme="neutral"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              {t("global.cancel")}
            </Button>
            <Button
              colorScheme="danger"
              loading={deleteSelectedLoading()}
              onClick={handleDeleteSelected}
            >
              {t("global.delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Drawer>
  )
}
