import { CLIEngine } from "eslint";
import pm from "picomatch";

export default class EslintProcessor {
  constructor({
    cwd = process.cwd(),
    patterns = [],
    ignorePatterns = [],
    formatter = "stylish",
    maxWarnings,
    emitWarning = true,
    failOnError = false,
    failOnWarning = false,
    plugins = [],
    customOptions = {},
  } = {}) {
    this.cwd = cwd;
    this.patterns = patterns;
    this.ignorePatterns = ignorePatterns;
    this.formatter = formatter;
    this.maxWarnings = maxWarnings;
    this.emitWarning = emitWarning;
    this.failOnError = failOnError;
    this.failOnWarning = failOnWarning;
    this.customOptions = customOptions;

    this.isMatch = pm(this.patterns, { ignore: this.ignorePatterns });

    const options = {
      ...this.customOptions,
      cwd: this.cwd,
      ignorePattern: this.customOptions.ignorePattern
        ? [...this.customOptions.ignorePattern, ...this.ignorePatterns]
        : this.ignorePatterns,
    };

    this.cli = new CLIEngine(options);
    plugins.forEach((name, plugin) => this.cli.addPlugin(name, plugin));
  }

  _lint(patterns) {
    let hasFilesChanged = false;
    const lintFormatter = this.cli.getFormatter(this.formatter);
    const report = this.cli.executeOnFiles(patterns);
    CLIEngine.outputFixes(report);

    report.results.forEach((lintResult) => {
      if (lintResult.output) {
        hasFilesChanged = true;
        console.info(`eslint fixed file at ${lintResult.filePath}`);
      }
    });

    // filtering out warnings
    if (!this.emitWarning) {
      report.results = CLIEngine.getErrorResults(report.results);
    }

    const text = lintFormatter(report.results);
    if (text.trim() !== "") console.log(text);

    if (this.failOnError && report.errorCount > 0) {
      throw new Error(
        `ESLint found ${report.errorCount} ${
          report.errorCount > 1 ? "errors" : "error"
        }`
      );
    }

    if (this.failOnWarning && report.warningCount > 0) {
      throw new Error(
        `ESLint found ${report.warningCount} ${
          report.warningCount > 1 ? "warnings" : "warning"
        }`
      );
    }

    const tooManyWarnings =
      this.maxWarnings >= 0 && report.warningCount > this.maxWarnings;
    if (tooManyWarnings) {
      throw new Error(
        `ESLint found too many warnings (maximum: ${this.maxWarnings})`
      );
    }

    return hasFilesChanged;
  }

  process() {
    return this._lint(this.patterns);
  }

  processFile(filePath) {
    if (!this.isMatch(filePath)) return false;
    return this._lint(filePath);
  }
}
