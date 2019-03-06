module.exports = {
  "roots": [
    "<rootDir>"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
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
  }
}
