/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  jsxSingleQuote: true,
  jsxBracketSameLine: true,
  tabWidth: 2,
  formatOnSave: true,
};
