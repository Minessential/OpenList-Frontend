import assert from "node:assert/strict"
import test from "node:test"

import {
  canShowServerDownloadAction,
  hasServerDownloadDirectories,
  deriveServerDownloadProgressBytes,
  extractCreatedServerDownloadTaskIds,
  canPauseServerDownloadTask,
  canRetryServerDownloadTask,
  canResumeServerDownloadTask,
  getServerDownloadStateText,
} from "../src/utils/server_download.ts"

test("server download action stays visible when selection includes a directory", () => {
  assert.equal(
    canShowServerDownloadAction(true, [{ is_dir: true }, { is_dir: false }]),
    true,
  )
  assert.equal(
    hasServerDownloadDirectories([{ is_dir: true }, { is_dir: false }]),
    true,
  )
})

test("derive downloaded bytes from progress and total size", () => {
  assert.deepEqual(deriveServerDownloadProgressBytes(25, 400), {
    downloadedBytes: 100,
    totalBytes: 400,
  })
  assert.deepEqual(deriveServerDownloadProgressBytes(25, 400, 128), {
    downloadedBytes: 128,
    totalBytes: 400,
  })
  assert.deepEqual(deriveServerDownloadProgressBytes(25, 400, undefined, 64), {
    downloadedBytes: 64,
    totalBytes: 400,
  })
})

test("extract created task ids from create response data with empty fallback", () => {
  assert.deepEqual(
    extractCreatedServerDownloadTaskIds({ task_ids: ["tid-1", "tid-2"] }),
    ["tid-1", "tid-2"],
  )
  assert.deepEqual(extractCreatedServerDownloadTaskIds({}), [])
  assert.deepEqual(extractCreatedServerDownloadTaskIds(undefined), [])
})

test("only failed server download tasks are retryable in the home drawer", () => {
  assert.equal(canRetryServerDownloadTask(7), true)
  assert.equal(canRetryServerDownloadTask(2), false)
  assert.equal(canRetryServerDownloadTask(1), false)
})

test("server download pause and resume actions follow task fields", () => {
  assert.equal(canPauseServerDownloadTask({ state: 1, paused: false }), true)
  assert.equal(canPauseServerDownloadTask({ state: 1, paused: true }), false)
  assert.equal(
    canResumeServerDownloadTask({ state: 1, paused: true, resumable: true }),
    true,
  )
  assert.equal(canResumeServerDownloadTask({ state: 7, resumable: true }), true)
  assert.equal(
    canResumeServerDownloadTask({ state: 7, resumable: false }),
    false,
  )
})

test("paused server download tasks override state text", () => {
  assert.equal(
    getServerDownloadStateText({ state: 1, paused: true }),
    "tasks.paused",
  )
  assert.equal(getServerDownloadStateText({ state: 1 }), "tasks.state.1")
})
