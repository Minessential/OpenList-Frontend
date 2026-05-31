import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  createDisclosure,
} from "@hope-ui/solid"
import { createSignal, lazy, onCleanup, Show, Suspense } from "solid-js"
import { FullLoading } from "~/components"
import { useT, useDownload } from "~/hooks"
import { getSettingBool, me, selectedObjs, selectAll, userCan } from "~/store"
import { UserMethods } from "~/types"
import {
  bus,
  canShowServerDownloadAction,
  handleResp,
  hasServerDownloadDirectories,
  notify,
  serverDownload,
} from "~/utils"
import { CenterIcon } from "./Icon"
import { useRouter } from "~/hooks"

export const canServerDownloadSelected = () =>
  canShowServerDownloadAction(userCan("server_download"), selectedObjs())

export const Download = () => {
  const t = useT()
  const colorScheme = "neutral"
  const { batchDownloadSelected, sendToAria2, playlistDownloadSelected } =
    useDownload()
  const { pathname, isShare } = useRouter()
  const submitServerDownload = async () => {
    if (isShare() || !canServerDownloadSelected()) return
    if (hasServerDownloadDirectories(selectedObjs())) {
      notify.warning(t("home.toolbar.server_download_not_support_dir"))
      return
    }
    const names = selectedObjs().map((obj) => obj.name)
    const resp = await serverDownload(pathname(), names)
    handleResp(resp, () => {
      notify.success(resp.message)
      selectAll(false)
    })
  }
  return (
    <Menu placement="top" offset={10}>
      <MenuTrigger as={CenterIcon} name="download" />
      <MenuContent>
        <MenuItem colorScheme={colorScheme} onSelect={batchDownloadSelected}>
          {t("home.toolbar.batch_download")}
        </MenuItem>
        <Show when={!isShare() && canServerDownloadSelected()}>
          <MenuItem colorScheme={colorScheme} onSelect={submitServerDownload}>
            {t("home.toolbar.server_download")}
          </MenuItem>
        </Show>
        <Show
          when={
            UserMethods.is_admin(me()) || getSettingBool("package_download")
          }
        >
          <MenuItem
            colorScheme={colorScheme}
            onSelect={() => {
              bus.emit("tool", "package_download")
            }}
          >
            {t("home.toolbar.package_download")}
          </MenuItem>
          <MenuItem
            colorScheme={colorScheme}
            onSelect={playlistDownloadSelected}
          >
            {t("home.toolbar.playlist_download")}
          </MenuItem>
        </Show>
        <MenuItem colorScheme={colorScheme} onSelect={sendToAria2}>
          {t("home.toolbar.send_aria2")}
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

const PackageDownload = lazy(() => import("./PackageDownload"))

export const PackageDownloadModal = () => {
  const t = useT()
  const handler = (name: string) => {
    if (name === "package_download") {
      if (!getSettingBool("package_download")) return
      onOpen()
    }
  }
  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })
  const { isOpen, onOpen, onClose } = createDisclosure()
  const [show, setShow] = createSignal("pre_tips")
  return (
    <Modal
      blockScrollOnMount={false}
      opened={isOpen()}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      // size={{
      //   "@initial": "xs",
      //   "@md": "md",
      // }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("home.toolbar.package_download")}</ModalHeader>
        <Suspense fallback={<FullLoading />}>
          <Show
            when={show() === "pre_tips"}
            fallback={<PackageDownload onClose={onClose} />}
          >
            <ModalBody>
              <p>{t("home.toolbar.pre_package_download-tips")}</p>
            </ModalBody>
            <ModalFooter display="flex" gap="$2">
              <Button onClick={onClose} colorScheme="neutral">
                {t("global.cancel")}
              </Button>
              <Button
                colorScheme="info"
                onClick={() => {
                  setShow("package_download")
                }}
              >
                {t("global.confirm")}
              </Button>
            </ModalFooter>
          </Show>
        </Suspense>
      </ModalContent>
    </Modal>
  )
}

export const ServerDownloadHandler = () => {
  const t = useT()
  const { pathname, isShare } = useRouter()
  const handler = async (name: string) => {
    if (name !== "server_download") return
    if (isShare() || !canServerDownloadSelected()) return
    if (hasServerDownloadDirectories(selectedObjs())) {
      notify.warning(t("home.toolbar.server_download_not_support_dir"))
      return
    }
    const resp = await serverDownload(
      pathname(),
      selectedObjs().map((obj) => obj.name),
    )
    handleResp(resp, () => {
      notify.success(resp.message)
      selectAll(false)
    })
  }
  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })
  return null
}
