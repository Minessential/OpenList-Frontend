import { useManageTitle } from "~/hooks"
import { TypeTasks } from "./Tasks"
import { getServerDownloadNameAnalyzer } from "./helper"

const ServerDownload = () => {
  useManageTitle("manage.sidemenu.server_download")
  return (
    <TypeTasks
      type="server_download"
      canRetry
      nameAnalyzer={getServerDownloadNameAnalyzer()}
    />
  )
}

export default ServerDownload
