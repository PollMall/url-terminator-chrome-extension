////////// Constants
const lsLinksKey = "url-terminator-links";
const lsToggle = "url-terminator-toggle";

let toggleGifTimeout;

////////// HTML Elements
const table = document.querySelector('table');
const newLink = document.getElementById("new-link");
const addBtn = document.getElementById("add-link");
const toggle = document.getElementById("toggle");
const toggleOnGif = document.getElementById("toggle-on-gif");
const toggleOffGif = document.getElementById("toggle-off-gif");

////////// Helpers
const getLocalStorageLinks = async () => {
  const { [lsLinksKey]: links } = await chrome.storage.sync.get(lsLinksKey);
  return Array.isArray(links) ? links : [];
}

const setLocalStorageLinks = (links) => chrome.storage.sync.set({ [lsLinksKey]: links || [] });

const getLocalStorageToggle = async () => {
  const { [lsToggle]: toggle } = await chrome.storage.sync.get(lsToggle);
  return toggle;
}

const setLocalStorageToggle = (toggle) => chrome.storage.sync.set({ [lsToggle]: toggle });

const validateNewLink = async (link) => {
  const links = await getLocalStorageLinks();
  return links.find((l) => l === link) === undefined;
};

const syncTableView = async () => {
  links = await getLocalStorageLinks();
  const tableRows = links.reduce((tableBody, l) => tableBody + createTableRow({ url: l }), '');
  table.innerHTML = tableRows;
  
  // add callback for remove btns
  const deleteBtns = table.querySelectorAll('button');
  deleteBtns.forEach((btn) => {
    const id = btn.id;
    btn.onclick = () => deleteLink(id.replace(/delete-link-/,''));
  });
}

const syncToggleView = async () => {
  toggle.checked = await getLocalStorageToggle();
}

////////// Handlers
// Disabled state of add btn
newLink.onchange = async (e) => {
  const link = e.target.value;
  addBtn.disabled = !link || !(await validateNewLink(link));
};

// Add a new link to the list
addBtn.onclick = async () => {
  links = await getLocalStorageLinks();
  links.push(newLink.value);
  await setLocalStorageLinks(links);
  newLink.value = '';
  await syncTableView();
};

// Block/unblock links
toggle.onchange = async (e) => {
  // disable any left timeout
  toggleGifTimeout && clearTimeout(toggleGifTimeout);

  // remove any left gif-active class name
  toggleOnGif.classList.remove('gif-active');
  toggleOffGif.classList.remove('gif-active');

  // set toggle value in local storage
  const toggleValue = e.target.checked;
  await setLocalStorageToggle(toggleValue);

  if (toggleValue) {
    // block links
    toggleOnGif.classList.add('gif-active');
  } else {
    // unblock links
    toggleOffGif.classList.add('gif-active');
  }
  toggleGifTimeout = setTimeout(() => {
    toggleOnGif.classList.remove('gif-active');
    toggleOffGif.classList.remove('gif-active');
  }, 2500);
};

const deleteLink = async (link) => {
  const links = await getLocalStorageLinks();
  await setLocalStorageLinks(links.filter((l) => l !== link));
  await syncTableView();
};

////////// Components
const createTableRow = ({ url }) => (
`
<tr>
  <td class="d-flex align-items-center">
    <span class="flex-grow-1 text-break">
      ${url}
    </span>
    <div class="vr mx-2"></div>
    <button id="delete-link-${url}" type="button" class="btn btn-outline-danger btn-sm">
      <span class="bi bi-trash-fill"></span>
    </button>
  </td>
</tr>
`);

////////// Initial state of the app
syncTableView();
syncToggleView();