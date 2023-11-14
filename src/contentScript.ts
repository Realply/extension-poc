import { createPopupContent } from "./popupContent";

console.log("LinkedIn Extension is running! - Tushar");

const icon = document.createElement("img");
icon.src = chrome.runtime.getURL("images/logo.png");

console.log("Icon URL:", icon.src);

icon.style.width = "50px";
icon.style.position = "fixed";
icon.style.top = "6px";
icon.style.right = "260px";
icon.style.zIndex = "9999";
icon.style.cursor = "pointer";

document.body.appendChild(icon);

icon.addEventListener("click", openPopup);

function openPopup(event: MouseEvent) {
  const popupContent = createPopupContent();
  document.body.appendChild(popupContent);

  document.addEventListener("click", closePopup);

  function closePopup(event: MouseEvent) {
    if (!popupContent.contains(event.target as Node)) {
      document.body.removeChild(popupContent);
      document.removeEventListener("click", closePopup);
    }
  }

  event.stopPropagation();
}
