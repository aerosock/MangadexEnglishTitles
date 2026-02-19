console.log("MangadexTitleTL Service Worker Loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SETTINGS_UPDATED") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, message).catch(() => {
                });
            });
        });
    }
});
