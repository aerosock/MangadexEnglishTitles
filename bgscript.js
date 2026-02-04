let decoder = new TextDecoder("utf-8");
let encoder = new TextEncoder();

let settings = {enabled: true, targetLang: "en"};



browser.storage.local.get(["enabled", "targetLang"]).then((res) => {
    if (res.enabled !== undefined) settings.enabled = res.enabled;
    if (res.targetLang) settings.targetLang = res.targetLang;
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === "SETTINGS_UPDATED") {
        settings = message.settings;
    }
});

browser.webRequest.onBeforeRequest.addListener(
  listening,
  { urls: ["https://api.mangadex.org/manga*"] },
  ["blocking"]
);

function listening(details) {
  const filter = browser.webRequest.filterResponseData(details.requestId);
  let data = [];
  filter.ondata = (event) =>{
    data.push(event.data);
  };

  filter.onerror = (event) => {
    console.log(`Error: ${filter.error}`);
  };

  filter.onstop = () => {
    let string = "";
    try{
        if (data.length == 1){
          string = decoder.decode(data[0])
        }
        else{
          for(let i = 0; i < data.length; i++){
            if (i == data.length-1){
              string += decoder.decode(data[i])
            }
            else{
              string += decoder.decode(data[i], {stream: true});//only stream to the decoder if it isnt the last element
            }
          }
        }
        if (!settings.enabled) {
                filter.write(encoder.encode(string));
                filter.close();
                return;
            }
        let json = JSON.parse(string); //jsoning it so we can manipulate the values
        for(let i=0; i < (json.data).length;i++){
          const enalttitle = (json.data[i].attributes.altTitles).find((title) => title.en)
          if (enalttitle){
            json.data[i].attributes.title = { "en": enalttitle.en };
          }
        }
      const output = JSON.stringify(json) // grinding back into a string to send back
      filter.write(encoder.encode(output));
    
    }
    
    catch(e){
      console.error("Error processing web request data: ", e);
      filter.write(encoder.encode(string));}
    filter.close();
    };
};

































// browser.webRequest.onBeforeRequest.addListener(
//   (details) => {
//     const filter = browser.webRequest.filterResponseData(details.requestId);
//     const chunks = [];

//     filter.ondata = (event) => {
//       chunks.push(event.data);
//     };

//     filter.onstop = () => {
//       try {
//         const buffer = new Blob(chunks);
//         buffer.text().then((text) => {
//           const json = JSON.parse(text);

//           // Example: replace title with first English altTitle if available
//           for (const item of json?.data || []) {
//             const alts = item?.attributes?.altTitles || [];
//             const altEn = alts.map((t) => t.en).find((t) => t && t.trim());
//             if (altEn) {
//               item.attributes.title = item.attributes.title || {};
//               item.attributes.title.en = altEn;
//             }
//           }

//           const out = JSON.stringify(json);
//           filter.write(encoder.encode(out));
//           filter.close();
//         });
//       } catch (e) {
//         filter.write(encoder.encode("{}"));
//         filter.close();
//       }
//     };
//   },
//   { urls: ["https://api.mangadex.org/manga*"] },
//   ["blocking"]
// );