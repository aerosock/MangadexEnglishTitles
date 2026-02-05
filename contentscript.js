let response;
browser.runtime.onMessage.addListener((request) => {
    if (request.action === "updateDOM") {
        response = request.data;
    }
});

async function main(){
  try{
    const matches = document.querySelectorAll("a.title > span");
    for (i=0; i < matches.length; i++){ {
      if (matches[i].dataset.mdDone) continue; // mark as done
      matches[i].dataset.mdDone = "1"; // if marked as done then skip
      let responsesg = response.data[i].attributes.altTitles

      let enname = (responsesg?.data?.[0]?.attributes?.altTitles || []).map((t) => t.en).find((t) => t && t.trim());// get first english alttitle from array
      //im replacing everything with an alt english title because frequently
      //the main title is actually jp-ro despite being marked as en which confuses the code 
      if (enname && enname !== matches[i].textContent) {
        console.log("Found English title: " + enname);
        title.textContent = enname;
        title.style.color = "red";
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
  debounceTimer = setTimeout(main, 300);
});
observer.observe(document.body, { childList: true, subtree: true });

main();
