Project has been boostraped with package Create React App (create-react-app@1.4.1).
Following changes has been made comparing to the original package:
- `npm run eject`
- [airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb) eslint configuration,
- prettier style formater with Facebook style
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
