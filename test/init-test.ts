import assert from "assert";
import fs from "fs";
import rimraf from "rimraf";
import {
  generateCustomizeManifest,
  getInitCustomizeManifest,
  InitCustomizeManifest
} from "../src/init";

describe("init", () => {
  const testDestDir = "testDestDir";

  describe("runInit", () => {
    afterEach(() => {
      rimraf.sync(`${testDestDir}`);
    });

    const assertManifestContent = (buffer: Buffer) => {
      const appCustomize = JSON.parse(
        fs.readFileSync("test/fixtures/get-appcustomize-init.json").toString()
      );
      assert.deepStrictEqual(JSON.parse(buffer.toString()), appCustomize);
    };

    it("should success generate customize-manifest.json", async () => {
      const manifestFile = `${testDestDir}/customize-manifest.json`;
      const manifestFileContent: InitCustomizeManifest = getInitCustomizeManifest(
        "1"
      );
      await generateCustomizeManifest(manifestFileContent, testDestDir);
      const content = fs.readFileSync(manifestFile);
      assertManifestContent(content);
      assert.ok(fs.existsSync(manifestFile), `test ${manifestFile} exists`);
    });
  });
});
