Project has been bootstraped with package Create React App (create-react-app@1.4.1).
Following changes has been made comparing to the generated app:
- `npm run eject`
- [airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb) eslint configuration,
```
"eslintConfig": {
  "extends": "airbnb",
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
```
- prettier style formater with Facebook style,
```
"prettier/prettier": ["warn", {
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": false,
  "jsxBracketSameLine": true,
  "parser": "flow"
}]
```
- pre-commit script which performs formatting of the code to match style set by prettier config, next run eslint and try to fix problems which can be auto-fixed. If error happens developer needs to fix all problems manually before he will be able to commit.
```
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