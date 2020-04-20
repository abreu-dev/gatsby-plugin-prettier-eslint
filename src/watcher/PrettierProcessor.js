import fs from "fs";
import path from "path";
import fg from "fast-glob";
import pm from "picomatch";
import prettier from "prettier";

export default class PrettierProcessor {
  constructor({
    cwd = process.cwd(),
    patterns = [],
    ignorePatterns = [],
    customOptions = {},
  } = {}) {
    this.cwd = cwd;
    this.patterns = patterns;
    this.ignorePatterns = ignorePatterns;
    this.customOptions = customOptions;
    this.isMatch = pm(this.patterns, { ignore: this.ignorePatterns });
  }

  _format(filePath) {
    const absoluteFilePath = path.join(this.cwd, filePath);
    const configFilePath = prettier.resolveConfigFile.sync(absoluteFilePath);
    const fileOptions = prettier.resolveConfig.sync(configFilePath);
    const options = {
      ...fileOptions,
      ...this.customOptions,
      filepath: filePath,
    };
    const originalText = fs.readFileSync(absoluteFilePath, {
      encoding: "utf8",
    });
    const formattedText = prettier.format(originalText, options);

    if (originalText === formattedText) return false;

    fs.writeFileSync(absoluteFilePath, formattedText, { encoding: "utf8" });
    console.info(`formatted file at ${absoluteFilePath}`);

    return true;
  }

  process() {
    let hasFilesChanged = false;

    try {
      fg.sync(this.patterns, {
        cwd: this.cwd,
        ignore: this.ignorePatterns,
        dot: true,
      }).forEach((entry) => {
        const changed = this._format(entry);
        if (changed) hasFilesChanged = true;
      });
    } catch (err) {
      console.error(err);
    }

    return hasFilesChanged;
  }

  processFile(filePath) {
    if (!this.isMatch(filePath)) return false;
    return this._format(filePath);
  }
}
