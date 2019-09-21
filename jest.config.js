module.exports = {
  "roots": [
    "<rootDir>"
  ],
  "preset": "ts-jest/presets/js-with-babel",
  "transformIgnorePatterns": [
     "/node_modules/(?!@jupyterlab).+\\.js$"
  ],
  "testRegex": "(/__tests__/src/.*|(\\.|/)(test|spec))\\.tsx?$",
  "testPathIgnorePatterns": ["<rootDir>/node_modules/"],
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "globals": {
    "ts-jest": {
      "tsConfig": "<rootDir>/tsconfig.spec.json"
    }
  },
  "setupFiles": [
    "<rootDir>/__tests__/setupJest.ts"
  ],
  "moduleNameMapper": {
    "\\.(css|less)$": "<rootDir>/__tests__/styleMock.js",
    "\\.svg$": "<rootDir>/__tests__/fileMock.js"
  }
}
