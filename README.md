<img alt="Gatsby Plugin Prettier Eslint" src="https://raw.githubusercontent.com/andreabreu-me/gatsby-plugin-prettier-eslint/master/images/gatsby-plugin-prettier-eslint.jpg" height="200" />

# gatsby-plugin-prettier-eslint

This plugin integrates Prettier and ESLint with Gatsby. You can use it in watch mode while you develop. It will listen for any changed files, and will apply the necessary actions according to Prettier and ESLint configuration presented in your project. You may also use only Prettier or ESLint alone.

## Install

- `npm install prettier`
- `npm install eslint`
- `npm install gatsby-plugin-prettier-eslint`

## How to use

- Run `npx eslint --init`, read more at: https://eslint.org/docs/user-guide/getting-started
- Follow the instructions to use ESLint to run Prettier at: https://prettier.io/docs/en/integrating-with-linters.html
- Then apply the following configs:

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-prettier-eslint",
      options: {
        prettier: {
          patterns: [
            // the pattern "**/*.{js,jsx,ts,tsx}" is not used because we will rely on `eslint --fix`
            "**/*.{css,scss,less}",
            "**/*.{json,json5}",
            "**/*.{graphql}",
            "**/*.{md,mdx}",
            "**/*.{html}",
            "**/*.{yaml,yml}",
          ],
        },
        eslint: {
          patterns: "**/*.{js,jsx,ts,tsx}",
          customOptions: {
            fix: true,
            cache: true,
          },
        },
      },
    },
  ],
};
```

<b>NOTE:</b> This plugin gives the flexibility to configure the way you prefer to run Prettier and ESLint together. Just make sure to not target the same files with Prettier and ESLint, as it may result in redundant work or bad behaviour.

## Default configuration

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-prettier-eslint",
      // this is the default configuration, override only what you need
      options: {
        cwd: process.cwd(), // path to a directory that should be considered as the current working directory
        watch: true, // format/lint on save
        initialScan: true, // if true, will format/lint the whole project on Gatsby startup
        onChangeFullScanLint: false, // if true, on file save always perform full scan lint
        onChangeFullScanFormat: false, // if true, on file save always perform full scan format
        prettierLast: false, // if true, will run Prettier after ESLint
        ignorePatterns: [
          "**/node_modules/**/*",
          "**/.git/**/*",
          "**/dist/**/*",
          ".cache/**/*",
          "public/**/*",
        ], // string or array of paths/files/globs to ignore
        prettier: {
          patterns: [], // string or array of paths/files/globs to include related only to Prettier
          ignorePatterns: [], // string or array of paths/files/globs to exclude related only to Prettier
          customOptions: {}, // see: https://prettier.io/docs/en/options.html
        },
        eslint: {
          patterns: [], // string or array of paths/files/globs to include related only to ESLint
          ignorePatterns: [], // string or array of paths/files/globs to exclude related only to ESLint
          formatter: "stylish", // set custom or third party formatter
          maxWarnings: undefined, // number of max warnings allowed, when exceed it will fail Gatsby build
          emitWarning: true, // if true, will emit lint warnings
          failOnError: false, // if true, any lint error will fail the build, you may set true only in your prod config
          failOnWarning: false, // same as failOnError but for warnings
          plugins: [], // an array of plugins to load for ESLint
          customOptions: {}, // see: https://eslint.org/docs/developer-guide/nodejs-api#cliengine
        },
      },
    },
  ],
};
```
