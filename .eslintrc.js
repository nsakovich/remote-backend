module.exports = {
  "extends": "airbnb-base",
  rules: {
      "indent": ["error", 4],
      "import/no-unresolved": 0,
      "import/prefer-default-export": 0,
      "class-methods-use-this": 0,
      "no-console": 0
  },
  parserOptions: {
       "ecmaVersion": 11,
       "sourceType": "module"
  },
  globals: {
  },
  env: {
       "node": true,
       "commonjs": true,
       "es6": true
  }
};
