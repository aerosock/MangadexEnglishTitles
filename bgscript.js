browser.runtime.onMessage.addListener(async (msg) => {
  if (msg?.type !== "fetchTitle") return;
  const URL = "https://api.mangadex.org/manga?title=" + encodeURIComponent(msg.jpname);
  const response = await fetch(URL);
  return response.json();
});