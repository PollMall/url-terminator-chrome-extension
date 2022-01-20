const lsBlockedLinksKey = "url-terminator-blocked-links";

const removeTrailingSlash = (url) => url.replace(/\/+$/,'');
const removeHTTPProtocol = (url) => url.replace(/https?:\/\//,'');
const removeWWW = (url) => url.replace(/www\./,'');

const sanitizeUrl = (url) => (
  [url].map((url) => removeTrailingSlash(url)).map((url) => removeHTTPProtocol(url)).map((url) => removeWWW(url)).pop()
)

const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const getLsBlockedLinks = async () => {
  const { [lsBlockedLinksKey]: links } = await chrome.storage.sync.get(lsBlockedLinksKey);
  return Array.isArray(links) ? links : [];
}

const removeTab = async (tabId) => {
  try {
    await chrome.tabs.remove(tabId);
  } catch (e) {
    console.error(e);
  }
}

chrome.runtime.onInstalled.addListener((reason) => {
  if(reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // chrome.tabs.create();
    console.log('installed');
  }
  // chrome.tabs.create();
})

chrome.tabs.onUpdated.addListener(async () => {
  const { id, url } = await getCurrentTab();
  const blockedLinks = await getLsBlockedLinks();
  if(blockedLinks.find((bl) => sanitizeUrl(bl) === sanitizeUrl(url)) !== undefined) {
    await removeTab(id);
  }
});

// chrome.tabs.onAttached.addListener((tabId, props) => {
//   console.log('onAttached');
//   console.log(props);
// });

// chrome.tabs.onCreated.addListener((tab) => {
//   console.log('onCreated');
//   console.log(tab);
// });