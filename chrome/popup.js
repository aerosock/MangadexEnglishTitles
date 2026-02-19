document.addEventListener("DOMContentLoaded", () => {
    const enableSwitch = document.getElementById("enableSwitch");
    const langInput = document.getElementById("langInput");
    const colorInput = document.getElementById("colorInput");

    chrome.storage.local.get(["enabled", "targetLang", "targetColor"]).then((result) => {
        enableSwitch.checked = result.enabled !== undefined ? result.enabled : true;
        langInput.value = result.targetLang || "en";
        colorInput.value = result.targetColor || "#87CEEB";
    });

    function saveSettings() {
        const settings = {
            enabled: enableSwitch.checked,
            targetLang: langInput.value.trim().toLowerCase(),
            targetColor: colorInput.value.trim()
        };

        chrome.storage.local.set(settings).then(() => {
            
            chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED", settings: settings });
        });
    }

    enableSwitch.addEventListener("change", saveSettings);
    langInput.addEventListener("input", saveSettings);
    colorInput.addEventListener("input", saveSettings);
});