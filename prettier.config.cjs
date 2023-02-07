/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120,
  jsxSingleQuote: true,
  endOfLine: 'auto',
  tabWidth: 2,
};
