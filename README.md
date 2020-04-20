![alt text](https://raw.githubusercontent.com/andreabreu-me/gatsby-plugin-prettier-eslint/master/images/gatsby-plugin-prettier-eslint.jpg "Gatsby Plugin Prettier Eslint")

# gatsby-plugin-prettier-eslint

TODO: write docs

## Install

`npm install --save gatsby-plugin-prettier-eslint`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-prettier-eslint",
      options: {
        cwd: process.cwd(),
        watch: true,
        initialScan: true,
        onChangeFullScanLint: false,
        onChangeFullScanFormat: false,
        prettierLast: false,
        // common ignore patterns
        ignorePatterns: [
          "**/node_modules/**/*",
          "**/.git/**/*",
          "**/dist/**/*",
          ".cache/**/*",
          "public/**/*",
        ],
        prettier: {
          patterns: [
            // the pattern "**/*.{js,jsx,ts,tsx}" is not used because we will rely on `eslint --fix`
            "**/*.{css,scss,less}",
            "**/*.{json,json5}",
            "**/*.{graphql,gql}",
            "**/*.{md,mdx}",
            "**/*.{html}",
            "**/*.{yaml,yml}",
          ],
          ignorePatterns: [],
          customOptions: {},
        },
        eslint: {
          patterns: "**/*.{js,jsx,ts,tsx}",
          ignorePatterns: [],
          formatter: "stylish",
          maxWarnings: undefined,
          emitWarning: true,
          failOnError: false,
          failOnWarning: false,
          plugins: [],
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
