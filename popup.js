document.addEventListener("DOMContentLoaded", () => {
    const enableSwitch = document.getElementById("enableSwitch");
    const langInput = document.getElementById("langInput");

    browser.storage.local.get(["enabled", "targetLang"]).then((result) => {
        enableSwitch.checked = result.enabled !== undefined ? result.enabled : true;
        langInput.value = result.targetLang || "en";
    });

    function saveSettings() {
        const settings = {
            enabled: enableSwitch.checked,
            targetLang: langInput.value.trim().toLowerCase()
        };

        browser.storage.local.set(settings).then(() => {
            
            browser.runtime.sendMessage({ type: "SETTINGS_UPDATED", settings: settings });
        });
    }

    enableSwitch.addEventListener("change", saveSettings);
    langInput.addEventListener("input", saveSettings);
});