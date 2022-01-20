const lsLinksKey = "url-terminator-links";
const lsToggle = "url-terminator-toggle";

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

const getLocalStorageLinks = async () => {
  const { [lsLinksKey]: links } = await chrome.storage.sync.get(lsLinksKey);
  return Array.isArray(links) ? links : [];
}

const getLocalStorageToggle = async () => {
  const { [lsToggle]: toggle } = await chrome.storage.sync.get(lsToggle);
  return toggle;
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
  const blockedLinks = await getLocalStorageLinks();
  const block = await getLocalStorageToggle();
  if(block && blockedLinks.find((bl) => sanitizeUrl(bl) === sanitizeUrl(url)) !== undefined) {
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