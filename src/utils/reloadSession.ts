/* istanbul ignore file */

/**
 * This is a hack to reload the session in the browser.
 */
export const reloadSession = () => {
  const event = new Event('visibilitychange');
  document.dispatchEvent(event);
};
