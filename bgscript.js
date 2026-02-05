let decoder = new TextDecoder("utf-8");
let encoder = new TextEncoder();

let settings = { enabled: true, targetLang: "en" };

browser.storage.local.get(["enabled", "targetLang"]).then((res) => {
    if (res.enabled !== undefined) settings.enabled = res.enabled;
    if (res.targetLang) settings.targetLang = res.targetLang;
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "SETTINGS_UPDATED") {
        settings = message.settings;
    }
});

browser.webRequest.onBeforeRequest.addListener(listening, {
    urls: ["https://api.mangadex.org/manga*"],
});

function listening(details) {
    const filter = browser.webRequest.filterResponseData(details.requestId);
    let data = [];
    filter.ondata = (event) => {
        data.push(event.data);
    };

    filter.onerror = (event) => {
        console.log(`Error: ${filter.error}`);
    };

    filter.onstop = () => {
        let string = "";
        try {
            if (data.length == 0) {
                filter.disconnect();
                return;
            }
            if (data.length == 1) {
                string = decoder.decode(data[0]);
            } else {
                for (let i = 0; i < data.length; i++) {
                    if (i == data.length - 1) {
                        string += decoder.decode(data[i]);
                    } else {
                        string += decoder.decode(data[i], { stream: true }); //only stream to the decoder if it isnt the last element
                    }
                }
            }
            if (!string || string.length == 0) {
                filter.disconnect();
                return;
            }
            console.log("before sets");
            if (!settings.enabled) {
                filter.write(encoder.encode(string));
                filter.disconnect();
                return;
            }
            console.log("after sets");
            let json = JSON.parse(string); //jsoning it so we can manipulate the values
            const targetLang = settings.targetLang || "en";

            if (!Array.isArray(json.data)) {
                filter.write(encoder.encode(string));
                filter.disconnect();
                return;
            }

            for (let i = 0; i < json.data.length; i++) {
                if (!json.data[i].attributes?.altTitles) continue;
                const enalttitle = json.data[i].attributes.altTitles.find(
                    (title) => title[targetLang],
                );
                const realentitle = json.data[i].attributes.altTitles.find(
                    (title) => title.en,
                );
                if (enalttitle) {
                    json.data[i].attributes.title = {
                        en: enalttitle[targetLang],
                    };
                } else if (realentitle) {
                    json.data[i].attributes.title = { en: realentitle.en };
                } else {
                    continue;
                }
            }
            const output = JSON.stringify(json);
            console.log(
                "✅ Writing modified response, first title:",
                json.data[0]?.attributes?.title,
            );
            browser.tabs.sendMessage(tabId, {
                action: "updateDOM",
                data: "some data",
            });
            filter.disconnect();
        } catch (e) {
            console.error("Error processing web request data: ", e);
            filter.write(encoder.encode(string));
        }
        filter.disconnect();
    };
}
