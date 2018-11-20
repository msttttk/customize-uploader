import fs from "fs";
import mkdirp from "mkdirp";
import { sep } from "path";
import { Constans } from "./constants";
import { CustomizeManifest } from "./index";
import KintoneApiClient, { AuthenticationError } from "./KintoneApiClient";
import { Lang } from "./lang";
import { getBoundMessage } from "./messages";
import { wait } from "./util";

export interface Option {
  lang: Lang;
  proxy: string;
  guestSpaceId: number;
  destDir: string;
}

export interface ImportCustomizeManifest {
  app: string;
}

interface UploadedFile {
  type: "FILE";
  file: {
    fileKey: string;
    name: string;
  };
}

interface CDNFile {
  type: "URL";
  url: string;
}
type CustomizeFile = UploadedFile | CDNFile;

interface GetAppCustomizeResp {
  scope: "ALL" | "ADMIN" | "NONE";
  desktop: any;
  mobile: any;
}

export async function importCustomizeSetting(
  kintoneApiClient: KintoneApiClient,
  manifest: ImportCustomizeManifest,
  status: {
    retryCount: number;
  },
  options: Option
): Promise<void> {
  const m = getBoundMessage(options.lang);
  const appId = manifest.app;
  let { retryCount } = status;

  try {
    const appCustomize = kintoneApiClient.getAppCustomize(appId);
    return appCustomize
      .then((resp: GetAppCustomizeResp) => {
        return exportAsManifestFile(appId, options.destDir, resp);
      })
      .then((resp: GetAppCustomizeResp) => {
        downloadCustomizeFiles(kintoneApiClient, appId, options.destDir, resp);
      })
      .catch(e => {
        throw e;
      });
  } catch (e) {
    const isAuthenticationError = e instanceof AuthenticationError;
    retryCount++;
    if (isAuthenticationError) {
      throw new Error(m("E_Authentication"));
    } else if (retryCount < Constans.MAX_RETRY_COUNT) {
      await wait(1000);
      console.log(m("E_Retry"));
      await importCustomizeSetting(
        kintoneApiClient,
        manifest,
        { retryCount },
        options
      );
    } else {
      throw e;
    }
  }
}

function exportAsManifestFile(
  appId: string,
  destRootDir: string,
  resp: GetAppCustomizeResp
): GetAppCustomizeResp {
  const toNameOrUrl = (destDir: string) => (f: CustomizeFile) => {
    if (f.type === "FILE") {
      return `${destDir}${sep}${f.file.name}`;
    } else {
      return f.url;
    }
  };

  const desktopJs: CustomizeFile[] = resp.desktop.js;
  const desktopCss: CustomizeFile[] = resp.desktop.css;
  const mobileJs: CustomizeFile[] = resp.mobile.js;

  const customizeJson: CustomizeManifest = {
    app: appId,
    scope: resp.scope,
    desktop: {
      js: desktopJs.map(toNameOrUrl(`${destRootDir}${sep}desktop${sep}js`)),
      css: desktopCss.map(toNameOrUrl(`${destRootDir}${sep}desktop${sep}css`))
    },
    mobile: {
      js: mobileJs.map(toNameOrUrl(`${destRootDir}${sep}mobile${sep}js`))
    }
  };

  if (!fs.existsSync(`${destRootDir}`)) {
    mkdirp.sync(`${destRootDir}`);
  }
  fs.writeFile(
    `${destRootDir}${sep}customize-manifest.json`,
    JSON.stringify(customizeJson, null, 4),
    err => {
      if (err) {
        throw err;
      }
    }
  );
  return resp;
}

function downloadCustomizeFiles(
  kintoneApiClient: KintoneApiClient,
  appId: string,
  destDir: string,
  { desktop, mobile }: GetAppCustomizeResp
) {
  const desktopJs: CustomizeFile[] = desktop.js;
  const desktopCss: CustomizeFile[] = desktop.css;
  const mobileJs: CustomizeFile[] = mobile.js;

  [
    `${destDir}${sep}desktop${sep}js${sep}`,
    `${destDir}${sep}desktop${sep}css${sep}`,
    `${destDir}${sep}mobile${sep}js${sep}`
  ].forEach(path => mkdirp.sync(path));

  desktopJs.forEach(
    downloadAndWriteFile(kintoneApiClient, `${destDir}${sep}desktop${sep}js`)
  );
  desktopCss.forEach(
    downloadAndWriteFile(kintoneApiClient, `${destDir}${sep}desktop${sep}css`)
  );
  mobileJs.forEach(
    downloadAndWriteFile(kintoneApiClient, `${destDir}${sep}mobile${sep}js`)
  );
}

function downloadAndWriteFile(
  kintoneApiClient: KintoneApiClient,
  destDir: string
): (f: CustomizeFile) => void {
  return f => {
    if (f.type === "URL") {
      return;
    }
    kintoneApiClient.downloadFile(f.file.fileKey).then(resp =>
      fs.writeFile(`${destDir}${sep}${f.file.name}`, resp, err => {
        if (err) {
          throw err;
        }
      })
    );
  };
}

export const runImport = async (
  domain: string,
  username: string,
  password: string,
  basicAuthUsername: string | null,
  basicAuthPassword: string | null,
  manifestFile: string,
  options: Option
): Promise<void> => {
  const manifest: ImportCustomizeManifest = JSON.parse(
    fs.readFileSync(manifestFile, "utf8")
  );
  const status = {
    retryCount: 0
  };

  const kintoneApiClient = new KintoneApiClient(
    username,
    password,
    basicAuthUsername,
    basicAuthPassword,
    domain,
    options
  );
  await importCustomizeSetting(kintoneApiClient, manifest, status, options);
};
