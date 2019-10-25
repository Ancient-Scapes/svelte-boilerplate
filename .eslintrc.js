module.exports = {
  parser: 'babel-eslint',
  extends: 'google',
  rules: {
    'comma-dangle' : [2, 'never'],
    'no-invalid-this': 1,
    semi: [0, 'never'],
    indent: ['error', 2]
  }
}