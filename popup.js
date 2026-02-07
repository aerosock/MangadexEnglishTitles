document.addEventListener("DOMContentLoaded", () => {
    const enableSwitch = document.getElementById("enableSwitch");
    const langInput = document.getElementById("langInput");
    const colorInput = document.getElementById("colorInput");

    browser.storage.local.get(["enabled", "targetLang", "targetColor"]).then((result) => {
        enableSwitch.checked = result.enabled !== undefined ? result.enabled : true;
        langInput.value = result.targetLang || "en";
        colorInput.value = result.targetColor || "red";
    });

    function saveSettings() {
        const settings = {
            enabled: enableSwitch.checked,
            targetLang: langInput.value.trim().toLowerCase(),
            targetColor: colorInput.value.trim()
        };

        browser.storage.local.set(settings).then(() => {
            
            browser.runtime.sendMessage({ type: "SETTINGS_UPDATED", settings: settings });
        });
    }

    enableSwitch.addEventListener("change", saveSettings);
    langInput.addEventListener("input", saveSettings);
    colorInput.addEventListener("input", saveSettings);
});