let response;
let settings = { enabled: true, targetLang: "en" };

browser.runtime.onMessage.addListener((request) => {
    if (request.action === "updateDOM") {
        response = request.data;
    }
});

browser.storage.local.get(["enabled", "targetLang"]).then((res) => {
    if (res.enabled !== undefined) settings.enabled = res.enabled;
    if (res.targetLang) settings.targetLang = res.targetLang;
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "SETTINGS_UPDATED") {
        settings = message.settings;
    }
});

async function main(){
  try{
    const matches = document.querySelectorAll("a.title > span");
    for (let i=0; i < matches.length; i++){ {
      if (matches[i].dataset.mdDone) continue; // mark as done
      matches[i].dataset.mdDone = "1"; // if marked as done then skip
      let responsesg = response?.data[i]?.attributes?.altTitles;
      const targetLang = settings.targetLang || "en";
      let enname = (responsesg || []).map((t) => t[targetLang]).find((t) => t && t.trim());// get first english alttitle from array
      let title = matches[i];
      let color = "red"; // default color
      if (enname && enname !== matches[i].textContent) {
        console.log("Found English title: " + enname);
        title.textContent = enname;
        title.style.color = color;
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
  debounceTimer = setTimeout(main, 100);
});
observer.observe(document.body, { childList: true, subtree: true });

main();
