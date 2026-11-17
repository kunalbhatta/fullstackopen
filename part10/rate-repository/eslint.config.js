const expo = require('eslint-config-expo/flat')

module.exports = [
  ...expo,
  { ignores: ['dist/**', '.expo/**'] },
  { files: ['**/*.test.jsx'], languageOptions: { globals: { test: 'readonly', expect: 'readonly', jest: 'readonly' } } },
]
