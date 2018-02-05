## Development workflow

The project has been bootstrapped using Create React App npm package (create-react-app@1.4.1). Please read [CREATE_REACT_APP.md](CREATE_REACT_APP.md) to get acquainted with development setup (I know it's long!). Slight modification compared to the generated setup has been made, all are bulleted below:
- `npm run eject`
- [airbnb](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb) eslint configuration instead of [react-app](https://github.com/facebookincubator/create-react-app/tree/master/packages/eslint-config-react-app). Airbnb rules are much stricter than rules provided by eslint-config-react-app.
```js
"eslintConfig": {
  "extends": ["airbnb"],
  "env": {
    "browser": true,
    "jest": true
  }
}
``` 
- The pre-commit script which performs fix and format of the code to match style set by ESlint config. For uncorrectable errors, a developer needs to fix them manually before committing.
```js
"scripts": {
  "precommit": "lint-staged"
  ...
},
"lint-staged": {
  "linters": {
    "new-priv/src/**/*.{js,jsx,json}": ["eslint --fix", "git add"]
  },
  "gitDir": "../"
}
```
- Development workflow is inspired by an article [Configure ESLint, Prettier, and Flow in VS Code for React Development](https://hackernoon.com/configure-eslint-prettier-and-flow-in-vs-code-for-react-development-c9d95db07213).
- [Prettier](https://prettier.io) has been integrated with ESlint. It will formats JavaScript followed by eslint --fix (check: precommit stage).
- Settings file for VS code editor (under `.vscode/settings.json`), which is recommended to work with. You can use your IDE of choice but it is recommended to intagrate Prettier plugin and configure in the following fashion (so the code will be formatted in the same way as in the precommit stage).
```js
{
  // Format a file on save. A formatter must be available, the file must not be auto-saved, and editor must not be shutting down.
  "editor.formatOnSave": true,
  // Enable/disable default JavaScript formatter (For Prettier)
  "javascript.format.enable": false,
  // Use 'prettier-eslint' instead of 'prettier'. Other settings will only be fallbacks in case they could not be inferred from eslint rules.
  "prettier.eslintIntegration": true
}
```
- Added [.editorconfig](http://editorconfig.org) file to define and maintain consistent coding styles between different editors and IDEs.
- Added Hot loading functionality ([React Hot Loader](https://github.com/gaearon/react-hot-loader)) which allow tweak React components in real time. Just save file in the editor and component will update without refresh in the browser.
- Added [enzyme](https://github.com/airbnb/enzyme) (JavaScript Testing utility for React) with additional matchers from [jest-enzyme](https://github.com/blainekasten/enzyme-matchers)

## State management with Redux

### Actions

### How to handle immutability

- OBJECT: Spread operator { ...object, value: "new" }
- ARRAYS: Spread operator for arrays [...arr, ...arr2, item]

### TO READ

- http://redux.js.org/docs/basics/UsageWithReact.html
- https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0
- https://daveceddia.com/react-project-structure/
- https://medium.com/javascript-scene/10-tips-for-better-redux-architecture-69250425af44
- https://egghead.io/courses/getting-started-with-redux

### Examples of good projects in react&redux

- https://github.com/rwieruch/favesound-redux
- https://github.com/andrewngu/sound-redux
