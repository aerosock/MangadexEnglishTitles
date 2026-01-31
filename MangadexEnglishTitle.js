console.log("script loaded")
const REQUEST_DELAY = 110;

async function getData(jpname) {
  const data = await browser.runtime.sendMessage({ type: "fetchTitle", jpname });
  console.log("Fetched data for " + jpname);
  return data;
}

async function main(){
  try{
    const matches = document.querySelectorAll("a.title > span");
    for (var title of matches) {
      await new Promise(r => setTimeout(r, REQUEST_DELAY));
      if (title.dataset.mdDone) continue; // mark as done
      title.dataset.mdDone = "1"; // if marked as done then skip
     let response = await getData(title.textContent);

      let enname = (response?.data?.[0]?.attributes?.altTitles || []).map((t) => t.en).find((t) => t && t.trim());// get first english alttitle from array
      //im replacing everything with an alt english title because frequently
      //the main title is actually jp-ro despite being marked as en which confuses the code 
      if (enname && enname !== title.textContent) {
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