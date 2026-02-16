console.log("contentscript loaded", location.href);

let response;
let settings = { enabled: true, targetLang: "en" };

browser.runtime.onMessage.addListener((request) => {
  if (request.action === "updateDOM") {
    response = request.data;
    main();
  }
}); 

browser.storage.local.get(["enabled", "targetLang", "targetColor"]).then((res) => {
    if (res.enabled !== undefined) settings.enabled = res.enabled;
    if (res.targetLang) settings.targetLang = res.targetLang;
    if (res.targetColor) settings.targetColor = res.targetColor;
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "SETTINGS_UPDATED") {
        settings = message.settings;

        document.querySelectorAll("a.title > span[data-md-done]").forEach((el) => {
            delete el.dataset.mdDone;
        });

        main();
    }
});

async function main(){
  try{
    if (!settings.enabled) return;
    if (!response?.data?.length) return;
    const matches = document.querySelectorAll("a.title > span");
    for (let i=0; i < matches.length; i++){ {
      if (matches[i].dataset.mdDone) continue; // mark as done
      let responsesg = response?.data[i]?.attributes?.altTitles;
      const targetLang = settings.targetLang || "en";
      const targetColor = settings.targetColor || "#87CEEB";
      let enname = (responsesg || []).map((t) => t[targetLang]).find((t) => t && t.trim());// get first english alttitle from array
      let title = matches[i];
      let color = targetColor; // use target color from settings
      if (enname && enname !== matches[i].textContent) {
        console.log("Found English title: " + enname);
        title.textContent = enname;
        title.style.color = color;
        matches[i].dataset.mdDone = "1"; // if marked as done then skip

      }
    }  
  }
}
  catch(error){
    console.error("Error fetching or processing data: ", error);
  }
}

let debounceTimer;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  if (!settings.enabled) return;
  debounceTimer = setTimeout(main, 100);
});
observer.observe(document.body, { childList: true, subtree: true });

main();