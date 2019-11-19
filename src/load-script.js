let cachedScripts = {};

export default function loadScript(src) {
  let existing = cachedScripts[src];
  if (existing) {
    return existing;
  }

  const promise = new Promise((resolve, reject) => {
    // Create script
    let script = document.createElement('script');
    script.src = src;
    script.async = true;

    // Script event listener callbacks for load and error
    const onScriptLoad = () => {
      resolve();
    };

    const onScriptError = () => {
      cleanup();

      // Remove from cachedScripts we can try loading again
      existing = cachedScripts[src];
      if (existing) {
        delete cachedScripts[src];
      }
      script.remove();

      reject(new Error('Unable to load script'));
    };

    script.addEventListener('load', onScriptLoad);
    script.addEventListener('error', onScriptError);

    // Add script to document body
    document.body.appendChild(script);

    // Remove event listeners on cleanup
    function cleanup() {
      script.removeEventListener('load', onScriptLoad);
      script.removeEventListener('error', onScriptError);
    };
  });

  cachedScripts[src] = promise;

  return promise;
}