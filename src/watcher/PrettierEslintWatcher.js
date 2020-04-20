import chokidar from "chokidar";

import EslintProcessor from "./EslintProcessor";
import PrettierProcessor from "./PrettierProcessor";

export default class PrettierEslintWatcher {
  constructor({
    cwd = process.cwd(),
    initialScan = true,
    ignorePatterns = [],
    onChangeFullScanLint = false,
    onChangeFullScanFormat = false,
    prettierLast = false,
    prettier = {},
    eslint = {},
  }) {
    this.cwd = cwd;
    this.initialScan = initialScan;
    this.ignorePatterns = ignorePatterns;
    this.onChangeFullScanLint = onChangeFullScanLint;
    this.onChangeFullScanFormat = onChangeFullScanFormat;
    this.prettierLast = prettierLast;
    this.lastTimeFilesChanged = 0;

    const fallbackToArray = (arg) => (typeof arg === "string" ? [arg] : arg);

    this.prettierProcessor = new PrettierProcessor({
      cwd,
      ...prettier,
      ignorePatterns: [
        ...fallbackToArray(ignorePatterns),
        ...fallbackToArray(prettier.ignorePatterns || []),
      ],
    });

    this.eslintProcessor = new EslintProcessor({
      cwd,
      ...eslint,
      ignorePatterns: [
        ...fallbackToArray(ignorePatterns),
        ...fallbackToArray(eslint.ignorePatterns || []),
      ],
    });

    this.patterns = [
      ...fallbackToArray(this.prettierProcessor.patterns),
      ...fallbackToArray(this.eslintProcessor.patterns),
    ];
  }

  fullScan() {
    if (this.prettierLast) {
      this.eslintProcessor.process();
      this.prettierProcessor.process();
    } else {
      this.prettierProcessor.process();
      this.eslintProcessor.process();
    }
  }

  _onFileWatched(filePath, stats) {
    let changed = false;

    /**
     * This fixes double output when files are changed by this plugin.
     * When watching and unwatching files with chokidar on demand,
     * CPU goes crazy, so this is the "best" option.
     */
    if (this.lastTimeFilesChanged > stats.mtimeMs) return;

    // https://github.com/paulmillr/chokidar/issues/1002
    try {
      if (this.prettierLast) {
        if (this.onChangeFullScanLint) {
          changed = this.eslintProcessor.process() || changed;
        } else {
          changed = this.eslintProcessor.processFile(filePath) || changed;
        }

        if (this.onChangeFullScanFormat) {
          changed = this.prettierProcessor.process() || changed;
        } else {
          changed = this.prettierProcessor.processFile(filePath) || changed;
        }
      } else {
        if (this.onChangeFullScanFormat) {
          changed = this.prettierProcessor.process() || changed;
        } else {
          changed = this.prettierProcessor.processFile(filePath) || changed;
        }

        if (this.onChangeFullScanLint) {
          changed = this.eslintProcessor.process() || changed;
        } else {
          changed = this.eslintProcessor.processFile(filePath) || changed;
        }
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }

    if (changed) {
      this.lastTimeFilesChanged = Date.now();
    }
  }

  start() {
    if (this.initialScan) {
      this.fullScan();
    }

    this.watcher = chokidar
      .watch(this.patterns, {
        cwd: this.cwd,
        ignored: this.ignorePatterns,
        ignoreInitial: true,
        ignorePermissionErrors: true,
        alwaysStat: true,
      })
      .on("add", this._onFileWatched.bind(this))
      .on("change", this._onFileWatched.bind(this));
  }
}
