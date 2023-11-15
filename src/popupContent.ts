export function createPopupContent(): HTMLElement {
  const popupContent = document.createElement("div");
  popupContent.style.position = "fixed";
  popupContent.style.top = "50px";
  popupContent.style.right = "50px";
  popupContent.style.padding = "10px";
  popupContent.style.background = "#fff";
  popupContent.style.border = "1px solid #ccc";
  popupContent.style.zIndex = "10000";

  // Button to start the campaign
  const startCampaignButton = document.createElement("button");
  startCampaignButton.innerText = "Start Campaign";
  startCampaignButton.addEventListener("click", startCampaign);

  popupContent.appendChild(startCampaignButton);

  // Display lead names in the popup
  const leadsData = scrapeLinkedInSearchResults();
  const leadNamesContainer = document.createElement("div");
  leadNamesContainer.style.marginTop = "10px";

  leadsData.forEach((leadData) => {
    const leadNameElement = document.createElement("div");
    leadNameElement.innerText = leadData.name;
    leadNamesContainer.appendChild(leadNameElement);
  });

  popupContent.appendChild(leadNamesContainer);

  return popupContent;
}

function startCampaign() {
  // Check if the current page is a LinkedIn search page
  if (isLinkedInSearchPage()) {
    // Execute scraping logic and store information in indexedDB
    // scrapeAndStoreLeads();
    const leadsData = scrapeLinkedInSearchResults();
    chrome.runtime.sendMessage({ action: "startCampaign", leadsData });
  } else {
    alert("Please navigate to a LinkedIn search page to start the campaign.");
  }
}

function isLinkedInSearchPage() {
  // Check if the current URL includes patterns specific to LinkedIn search pages
  const searchPageUrlPattern = /linkedin\.com\/search\/results\/people/i;
  return searchPageUrlPattern.test(window.location.href);
}

// Assume you have a function to scrape data from the LinkedIn search results
function scrapeLinkedInSearchResults(): any[] {
  const leadsData: any[] = [];
  const names = document.querySelectorAll(
    "div.entity-result__content .entity-result__title-text a>span>span:first-child"
  ) as NodeListOf<HTMLElement>;
  const titles = document.querySelectorAll(
    "div.entity-result__content .entity-result__primary-subtitle"
  ) as NodeListOf<HTMLElement>;
  const urls = document.querySelectorAll(
    "div.entity-result__content .entity-result__title-text a"
  ) as NodeListOf<HTMLAnchorElement>;
  const locations = document.querySelectorAll(
    "div.entity-result__content .entity-result__secondary-subtitle"
  ) as NodeListOf<HTMLElement>;

  // Iterate over the elements and store data in leadsData array
  for (let i = 0; i < names.length; i++) {
    const name = names[i].innerText.trim();
    const title = titles[i].innerText.trim();
    const profileLink = urls[i].href.trim() as any;
    const location = locations[i].innerText.trim();
    const profileUrn = profileLink?.split("/").pop().split("%3A").pop();

    leadsData.push({
      name,
      title,
      profileLink,
      location,
      profileUrn,
    });
  }

  console.log(leadsData);
  return leadsData;
}

function scrapeAndStoreLeads() {
  // Retrieve scraped information from the LinkedIn search results
  const leadsData = scrapeLinkedInSearchResults();

  // Open an indexedDB database
  const request = window.indexedDB.open("LinkedInLeadsDB", 1);

  request.onerror = function (event) {
    console.error("Error opening database:", event);
  };

  request.onsuccess = function (event) {
    const db = (event.target as any).result; // Cast to 'any' to access 'result'

    // Create a transaction and an object store
    const transaction = db.transaction(["leads"], "readwrite");
    const objectStore = transaction.objectStore("leads");

    // Add each lead data to the object store
    leadsData.forEach((leadData) => {
      const addRequest = objectStore.add(leadData);

      addRequest.onsuccess = function (event: any) {
        console.log("Lead data added to indexedDB successfully!");
      };

      addRequest.onerror = function (event: any) {
        console.error("Error adding lead data:", event.target.errorCode);
      };
    });
  };

  request.onupgradeneeded = function (event) {
    // Create an object store if it doesn't exist
    const db = (event.target as any).result; // Cast to 'any' to access 'result'
    const objectStore = db.createObjectStore("leads", {
      keyPath: "profileLink",
    });

    // You can add more properties to the object store as needed
  };
}
