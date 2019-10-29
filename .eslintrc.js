module.exports = {
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  env: {
    es6: true,
    browser: true
  },
  plugins: [ 'svelte3' ],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3'
    }
  ],
  extends: 'google',
  rules: {
    'comma-dangle' : [2, 'never'],
    'no-invalid-this': 1,
    semi: [0, 'never'],
    indent: ['error', 2]
  }
}