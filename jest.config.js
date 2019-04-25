module.exports = {
  "roots": [
    "<rootDir>"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
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
    "\\.(css|less)$": "<rootDir>/__tests__/styleMock.js"
  }
}
