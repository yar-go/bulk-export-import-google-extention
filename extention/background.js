const MAX_LOGS = 1000;
const NEGATE_SIZE = 100;

async function addLog(msg){
  let data = [];
  let result = await chrome.storage.local.get("logger");
  if (result.logger) data = result.logger;
  if(data.length > MAX_LOGS) data = data.slice(NEGATE_SIZE);
  data.push(msg);
  await chrome.storage.local.set({"logger":data});
  return 0;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.log){
      addLog(request.log);
      if (request.log.error){
        chrome.action.setBadgeText({tabId:sender.tab.id, text:"error"});
        chrome.action.setBadgeBackgroundColor({tabId:sender.tab.id, color:"red"});
      }else{
        chrome.action.setBadgeText({tabId:sender.tab.id, text:""});
      }
    }
  }
);