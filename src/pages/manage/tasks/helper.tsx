import { createSignal, JSX } from "solid-js"
import { me } from "~/store"
import { TaskNameAnalyzer } from "./Tasks"
import { useT } from "~/hooks"

export const getPath = (
  device: string,
  path: string,
  asLink: boolean = true,
): JSX.Element => {
  const fullPath = (device === "/" ? "" : device) + path
  const prefix = me().base_path === "/" ? "" : me().base_path
  const accessible = fullPath.startsWith(prefix)
  const [underline, setUnderline] = createSignal(false)
  return accessible && asLink ? (
    <a
      style={underline() ? "text-decoration: underline" : ""}
      onMouseOver={() => setUnderline(true)}
      onMouseOut={() => setUnderline(false)}
      href={fullPath.slice(prefix.length)}
    >
      {fullPath}
    </a>
  ) : (
    <p>{fullPath}</p>
  )
}

export const getOfflineDownloadNameAnalyzer = (): TaskNameAnalyzer => {
  const t = useT()
  const [underline, setUnderline] = createSignal(false)
  return {
    regex: /^download (.+) to \((.+)\)$/,
    title: (matches) => matches[1],
    attrs: {
      [t(`tasks.attr.offline_download.url`)]: (matches) => (
        <a
          style={underline() ? "text-decoration: underline" : ""}
          onMouseOver={() => setUnderline(true)}
          onMouseOut={() => setUnderline(false)}
          href={matches[1]}
          target="_blank"
        >
          {matches[1]}
        </a>
      ),
      [t(`tasks.attr.offline_download.path`)]: (matches) =>
        getPath("", matches[2]),
    },
  }
}

export const getOfflineDownloadTransferNameAnalyzer = (): TaskNameAnalyzer => {
  const t = useT()
  const [underline, setUnderline] = createSignal(false)
  return {
    regex: /^(transfer|upload) \[(.*)]\((.*\/([^\/]+))\) to \[(.+)]\((.+)\)$/,
    title: (matches) => (matches[1] === "upload" ? matches[2] : matches[4]),
    attrs: {
      [t(`tasks.attr.offline_download.transfer_src`)]: (matches) => {
        return matches[1] !== "transfer" || matches[2] === ""
          ? undefined
          : getPath(matches[2], matches[3])
      },
      [t(`tasks.attr.offline_download.transfer_src_local`)]: (matches) => {
        return matches[2] === "" ? matches[3] : undefined
      },
      [t(`tasks.attr.offline_download.url`)]: (matches) => {
        return matches[1] === "upload" ? (
          <a
            style={underline() ? "text-decoration: underline" : ""}
            onMouseOver={() => setUnderline(true)}
            onMouseOut={() => setUnderline(false)}
            href={matches[3]}
            target="_blank"
          >
            {matches[3]}
          </a>
        ) : undefined
      },
      [t(`tasks.attr.offline_download.transfer_dst`)]: (matches) =>
        getPath(matches[5], matches[6]),
    },
  }
}

export const getServerDownloadNameAnalyzer = (): TaskNameAnalyzer => {
  const t = useT()
  return {
    regex: /^server download \[(.*)]\((.*)\) to \((.+)\)$/,
    title: (matches) => {
      const parts = matches[2].split("/")
      return parts[parts.length - 1] || "/"
    },
    attrs: {
      [t(`tasks.attr.server_download.src`)]: (matches) =>
        getPath(matches[1], matches[2]),
      [t(`tasks.attr.server_download.dst`)]: (matches) => <p>{matches[3]}</p>,
    },
  }
}

export const getDecompressNameAnalyzer = (): TaskNameAnalyzer => {
  const t = useT()
  return {
    regex:
      /^decompress \[(.+)]\((.*\/([^\/]+))\)\[(.+)] to \[(.+)]\((.+)\) with password <(.*)>$/,
    title: (matches) => matches[3],
    attrs: {
      [t(`tasks.attr.decompress.src`)]: (matches) =>
        getPath(matches[1], matches[2]),
      [t(`tasks.attr.decompress.dst`)]: (matches) =>
        getPath(matches[5], matches[6]),
      [t(`tasks.attr.decompress.inner`)]: (matches) => <p>{matches[4]}</p>,
      [t(`tasks.attr.decompress.password`)]: (matches) => <p>{matches[7]}</p>,
    },
  }
}

export const getDecompressUploadNameAnalyzer = (): TaskNameAnalyzer => {
  const t = useT()
  return {
    regex: /^upload (.+) to \[(.+)]\((.+)\)$/,
    title: (matches) => matches[1],
    attrs: {
      [t(`tasks.attr.decompress.dst`)]: (matches) =>
        getPath(matches[2], matches[3]),
    },
  }
}
