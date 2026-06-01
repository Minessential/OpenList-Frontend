export enum TaskStateEnum {
  Pending,
  Running,
  Succeeded,
  Canceling,
  Canceled,
  Errored,
  Failing,
  Failed,
  WaitingRetry,
  BeforeRetry,
}

export interface TaskInfo {
  id: string
  type?: string
  name: string
  creator: string
  creator_role: number
  state: number
  state_text?: string
  status: string
  progress: number
  start_time: string | null
  end_time: string | null
  total_bytes: number
  downloaded_bytes?: number
  paused?: boolean
  resumable?: boolean
  resume_offset?: number
  partial_local_path?: string
  src_path?: string
  src_storage_mp?: string
  dst_local_path?: string
  error: string
  failed_reason?: string
}

export interface ServerDownloadCreateResp {
  task_ids?: string[]
  tasks?: TaskInfo[]
}
