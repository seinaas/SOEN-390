/*
*		Reload Session Hack
*
*
*		The reloadSession function is a hack to reload the session in the browser by dispatching a visibilitychange event.
*/		
/* istanbul ignore file */


export const reloadSession = () => {
  const event = new Event('visibilitychange');
  document.dispatchEvent(event);
};
