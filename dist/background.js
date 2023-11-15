"use strict";
// Open or create the IndexedDB database
var request = indexedDB.open("LinkedInLeadsDB", 1);
request.onerror = function (event) {
    console.error("Database error: " + event.target.errorCode);
};
request.onupgradeneeded = function (event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("leads", {
        keyPath: "profileLink",
        autoIncrement: true,
    });
};
request.onsuccess = function (event) {
    var db = event.target.result;
    // Function to retrieve all data from the object store
    function getAllData() {
        var transaction = db.transaction(["leads"], "readonly");
        var objectStore = transaction.objectStore("leads");
        var getAllRequest = objectStore.openCursor();
        getAllRequest.onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                var data = cursor.value;
                console.log("Retrieved data:", data);
                cursor.continue();
            }
            else {
                console.log("No more data!");
            }
        };
        getAllRequest.onerror = function (event) {
            console.error("Error getting data: " + event.target.errorCode);
        };
    }
    // Set up a timer to automatically retrieve data every 3 seconds
    setInterval(function () {
        getAllData();
    }, 3000);
    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === "startCampaign") {
            console.log("Received leadsData:", request.leadsData);
            // Add received leadsData to the object store
            var transaction = db.transaction(["leads"], "readwrite");
            var objectStore = transaction.objectStore("leads");
            request.leadsData.forEach(function (leadData) {
                var addRequest = objectStore.add(leadData);
                addRequest.onsuccess = function () {
                    console.log("Lead data added to IndexedDB");
                };
                addRequest.onerror = function (event) {
                    console.error("Error adding lead data:", event.target.errorCode);
                };
            });
        }
        else if (request.action === "getData") {
            // Retrieve all data from the object store
            getAllData();
        }
    });
};
