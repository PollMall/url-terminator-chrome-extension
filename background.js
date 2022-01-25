const lsLinksKey = "url-terminator-links";
const lsToggle = "url-terminator-toggle";

const removeTrailingSlash = (url) => url?.replace(/\/+$/,'');
const removeHTTPProtocol = (url) => url?.replace(/https?:\/\//,'');
const removeWWW = (url) => url?.replace(/www\./,'');
const removeEscapeSymbol = (url) => url?.replace(/^!/, '');

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

// Retrieve escaped links (i.e links that start with an exclamation mark)
const getEscapedLinks = (blockedLinks) => blockedLinks.reduce((arr, bl) => bl[0] === "!" ? arr.concat(removeEscapeSymbol(bl)) : arr, []);

const removeTab = async (tabId) => {
  try {
    await chrome.tabs.remove(tabId);
  } catch (e) {
    console.error(e);
  }
}

const checkForBlockedLinks = async (tabId, tabUrl) => {
  const blockedLinks = await getLocalStorageLinks();
  const block = await getLocalStorageToggle();
  const escapedLinks = getEscapedLinks(blockedLinks);

  // If tab URL is an escaped URL do nothing
  if(escapedLinks.find((el) => sanitizeUrl(tabUrl)?.includes(sanitizeUrl(el)))) return;

  // Check if tab URL is the exact path or subpath of any blocked link 
  if(block && blockedLinks.find((bl) => sanitizeUrl(tabUrl)?.includes(sanitizeUrl(bl)))) {
    await removeTab(tabId);
  }
}

// For duplicating/opening a URL in a new tab
chrome.tabs.onActivated.addListener(async () => {
  const { id, url } = await getCurrentTab();
  await checkForBlockedLinks(id, url);
})

// For manyally inserting a URL
chrome.tabs.onUpdated.addListener(async (id, _, { url }) => {
  await checkForBlockedLinks(id, url);
});