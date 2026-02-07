let decoder = new TextDecoder("utf-8");
let encoder = new TextEncoder();

let settings = { enabled: true, targetLang: "en" };
console.log("bgscript loaded");


browser.storage.local.get(["enabled", "targetLang"]).then((res) => {
    if (res.enabled !== undefined) settings.enabled = res.enabled;
    if (res.targetLang) settings.targetLang = res.targetLang;
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "SETTINGS_UPDATED") {
        settings = message.settings;
    }
});
console.log("bgscript loaded 2");

console.log("filterResponseData exists:", typeof browser.webRequest.filterResponseData);

browser.webRequest.onBeforeRequest.addListener(
  listening,
  { urls: ["<all_urls>"] },
  ["blocking"]
);

function listening(details) {
    //this has taken so long to figure out. the listener wouldnt trigger if you put the api.mangadex in there no matter what. 
    //it only triggers if you put all urls and then filter all of the incoming triggers like done below
    //much more resource intensive i assume but oh well
  if (!details.url.startsWith("https://api.mangadex.org/manga?")) return;
  console.log("bgscript listening", details.url, details.tabId);

  const filter = browser.webRequest.filterResponseData(details.requestId);
  let data = [];

  filter.ondata = (event) => {
      data.push(event.data);
  };

  filter.onerror = () => {
      console.log(`Error: ${filter.error}`);
  };

  filter.onstop = () => {
    let string = "";
    try {
        if (data.length === 0) {
            filter.disconnect();
            return;
        }
        if (data.length === 1) {
            string = decoder.decode(data[0]);
        } else {
            for (let i = 0; i < data.length; i++) {
                if (i === data.length - 1) {
                    string += decoder.decode(data[i]);
                } else {
                    string += decoder.decode(data[i], { stream: true });
                }
            }
        }

        if (!string) {
            filter.disconnect();
            return;
        }

        // pass-through response
        filter.write(encoder.encode(string));

        let json = JSON.parse(string);

        browser.tabs.sendMessage(details.tabId, {
            action: "updateDOM",
            data: json,
        });
    } catch (e) {
        console.error("Error processing web request data: ", e);
        // still pass-through if decode/parse fails
        if (string) {
            filter.write(encoder.encode(string));
        }
    }
    filter.disconnect();
};
}
