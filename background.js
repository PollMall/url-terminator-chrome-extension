chrome.runtime.onInstalled.addListener((reason) => {
  if(reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // chrome.tabs.create();
    console.log('installed');
  }
  // chrome.tabs.create();
})

chrome.tabs.onUpdated.addListener((tabId, props) => {
  console.log('onUpdated');
  console.log(props);
});

chrome.tabs.onAttached.addListener((tabId, props) => {
  console.log('onAttached');
  console.log(props);
});

chrome.tabs.onCreated.addListener((tab) => {
  console.log('onCreated');
  console.log(tab);
});