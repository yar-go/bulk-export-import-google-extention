const UPDATE_API = "https://github.com/yar-go/bulk-export-import-google-extention/blob/main/.version?raw=true";

/*-----------------------Setup elements---------------------- */
const terminal = document.querySelector("textarea");
terminal.info = function(text){
  this.append(`[INFO] ${text}\n`);
};
terminal.error = function(text){
  this.append(`[ERROR] ${text}\n`);
}
terminal.clear = function (){
  this.innerText = '';
}

const notify = document.querySelector("div[id=notify]")
notify.show = function (type, show=true){
  if (show) show = '';
  else show = 'none';
  switch (type){
    case "Use":
      notify.children[0].style.display = show;
      break;
    case "Not":
      notify.children[1].style.display = show;
      break;
    case "Update":
      notify.children[2].style.display = show;
      break;
    default:
      break;
  }
};
/*-----------------------End setup elements---------------------- */

/*-----------------------Logic---------------------- */

// check content-script available
(async ()=>{
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  chrome.tabs.sendMessage(tab.id, {"checkContent": "check"}).then((response)=>{
      if (response){
        notify.show("Use", true);
      }
  }).catch((error)=>{
    notify.show("Not", true);
    return 1;
  } );
})();
// end check content-script available

// logging
function showLog(data){
  terminal.scroll(0, terminal.scrollHeight)
  terminal.clear();
    data.forEach((value)=>{
      if(value.info) terminal.info(value.info);
      if(value.error) terminal.error(value.error);
    });
}
chrome.storage.local.get(["logger"]).then((result) => {
  let data = [];
  if (result.logger) data = result.logger;
  showLog(data);
  terminal.scroll(0, terminal.scrollHeight);
});
chrome.storage.local.onChanged.addListener((changes)=>{
  showLog(changes.logger.newValue);
});
// end logging

// update check
fetch(UPDATE_API, {cache: "no-store"}).then(
    (responce)=>{
      if (responce.ok){
        responce.text().then(
            (result)=>{
                const actVer = result;
                const insVer = chrome.runtime.getManifest().version;
                if (actVer !== insVer){
                    notify.show('Update', true);
                }else{
                    notify.show('Update', false);
                }
            }
        )
      }
    }
)

// end update check

/*-----------------------End logic---------------------- */