Project has been bootstraped using Create React App npm package (create-react-app@1.4.1). Please read [CREATE_REACT_APP.md](CREATE_REACT_APP.md) to get aquinted with development setup (I know it's long!). Slight modification comparing to the generated setup has been made, all are bulleted below:
- `npm run eject`
- [airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb) eslint configuration instead of [react-app](https://github.com/facebookincubator/create-react-app/tree/master/packages/eslint-config-react-app). Airbnb rules are much stricter than rules provided by eslint-config-react-app.
```js
"eslintConfig": {
  "extends": "airbnb",
  ...
```
- [prettier](https://github.com/prettier/prettier) with [eslint plugin](https://github.com/prettier/eslint-plugin-prettier). Style formater configured on Facebook style ("fb"),
```js
  // continuation of eslintConfig
  ...
  "plugins": [
    "prettier"
  ],
  "rules": {
    "prettier/prettier": [
      "warn",
      "fb"
    ]
  },
  "env": {
    "browser": true,
    "jest": true
  }
}
// Facebook style is equivalent to:
// "prettier/prettier": ["warn", {
//   "singleQuote": true,
//   "trailingComma": "all",
//   "bracketSpacing": false,
//   "jsxBracketSameLine": true,
//   "parser": "flow"
// }]
```
- pre-commit script which performs formatting of the code to match style set by prettier config, next run eslint and try to fix problems which can be auto-fixed. If error happens developer needs to fix all problems manually before he will be able to commit.
```js
"scripts": {
  "precommit": "lint-staged"
},
"lint-staged": {
  "linters": {
    "new-priv/src/**/*.{js,jsx,json,css}": [
      "prettier --write",
      "git add"
    ],
    "new-priv/src/**/*.{js,jsx,json}": [
      "eslint --fix",
      "git add"
    ]
  },
  "gitDir": "../"
}
```
- added [.editorconfig](http://editorconfig.org) file to define and maintain consistent coding styles between different editors and IDEs.
- hot reload TBD
