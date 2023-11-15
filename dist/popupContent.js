export function createPopupContent() {
    var popupContent = document.createElement("div");
    popupContent.style.position = "fixed";
    popupContent.style.top = "50px";
    popupContent.style.right = "50px";
    popupContent.style.padding = "10px";
    popupContent.style.background = "#fff";
    popupContent.style.border = "1px solid #ccc";
    popupContent.style.zIndex = "10000";
    // Button to start the campaign
    var startCampaignButton = document.createElement("button");
    startCampaignButton.innerText = "Start Campaign";
    startCampaignButton.addEventListener("click", startCampaign);
    popupContent.appendChild(startCampaignButton);
    // Display lead names in the popup
    var leadsData = scrapeLinkedInSearchResults();
    var leadNamesContainer = document.createElement("div");
    leadNamesContainer.style.marginTop = "10px";
    leadsData.forEach(function (leadData) {
        var leadNameElement = document.createElement("div");
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
        var leadsData = scrapeLinkedInSearchResults();
        chrome.runtime.sendMessage({ action: "startCampaign", leadsData: leadsData });
    }
    else {
        alert("Please navigate to a LinkedIn search page to start the campaign.");
    }
}
function isLinkedInSearchPage() {
    // Check if the current URL includes patterns specific to LinkedIn search pages
    var searchPageUrlPattern = /linkedin\.com\/search\/results\/people/i;
    return searchPageUrlPattern.test(window.location.href);
}
// Assume you have a function to scrape data from the LinkedIn search results
function scrapeLinkedInSearchResults() {
    var leadsData = [];
    var names = document.querySelectorAll("div.entity-result__content .entity-result__title-text a>span>span:first-child");
    var titles = document.querySelectorAll("div.entity-result__content .entity-result__primary-subtitle");
    var urls = document.querySelectorAll("div.entity-result__content .entity-result__title-text a");
    var locations = document.querySelectorAll("div.entity-result__content .entity-result__secondary-subtitle");
    // Iterate over the elements and store data in leadsData array
    for (var i = 0; i < names.length; i++) {
        var name_1 = names[i].innerText.trim();
        var title = titles[i].innerText.trim();
        var profileLink = urls[i].href.trim();
        var location_1 = locations[i].innerText.trim();
        var profileUrn = profileLink === null || profileLink === void 0 ? void 0 : profileLink.split("/").pop().split("%3A").pop();
        leadsData.push({
            name: name_1,
            title: title,
            profileLink: profileLink,
            location: location_1,
            profileUrn: profileUrn,
        });
    }
    console.log(leadsData);
    return leadsData;
}
function scrapeAndStoreLeads() {
    // Retrieve scraped information from the LinkedIn search results
    var leadsData = scrapeLinkedInSearchResults();
    // Open an indexedDB database
    var request = window.indexedDB.open("LinkedInLeadsDB", 1);
    request.onerror = function (event) {
        console.error("Error opening database:", event);
    };
    request.onsuccess = function (event) {
        var db = event.target.result; // Cast to 'any' to access 'result'
        // Create a transaction and an object store
        var transaction = db.transaction(["leads"], "readwrite");
        var objectStore = transaction.objectStore("leads");
        // Add each lead data to the object store
        leadsData.forEach(function (leadData) {
            var addRequest = objectStore.add(leadData);
            addRequest.onsuccess = function (event) {
                console.log("Lead data added to indexedDB successfully!");
            };
            addRequest.onerror = function (event) {
                console.error("Error adding lead data:", event.target.errorCode);
            };
        });
    };
    request.onupgradeneeded = function (event) {
        // Create an object store if it doesn't exist
        var db = event.target.result; // Cast to 'any' to access 'result'
        var objectStore = db.createObjectStore("leads", {
            keyPath: "profileLink",
        });
        // You can add more properties to the object store as needed
    };
}
