const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [resource, config] = args;

  const response = await originalFetch(resource, config);

  if (response.url.includes('api.mangadex.org/manga')) {
    
    const clone = response.clone();
    
    clone.json().then(data => {
      window.postMessage({ type: "TITLE_JSON", data: data }, "*");
    }).catch(err => console.error("Interceptor JSON error", err));
  }

  return response;
};