const lsLinksKey = 'url-terminator-links';
const lsBlockedLinksKey = 'url-terminator-blocked-links';

const newLink = document.getElementById("new-link");
const addBtn = document.getElementById("add-link");
const toggle = document.getElementById("toggle");

// Disabled state of add btn
newLink.onchange = (e) => {
  addBtn.disabled = !e.target.value;
}

// Add a new link to the list
addBtn.onclick = () => {
  const links = JSON.parse(localStorage.getItem(lsLinksKey)) || [];
  links.push(newLink.value);
  localStorage.setItem(lsLinksKey, JSON.stringify(links));
}

// Block/unblock links
toggle.onchange = (e) => {
  if (e.target.checked) {
    // block links
    const links = JSON.parse(localStorage.getItem(lsLinksKey)) || [];
    localStorage.setItem(lsBlockedLinksKey, JSON.stringify(links));
  } else {
    // unblock links
    localStorage.removeItem(lsBlockedLinksKey);
  }
}