"use strict";
chrome.runtime.onInstalled.addListener(function () {
    // Schedule a job to send connection requests every 5 seconds for testing
    chrome.alarms.create("sendConnectionRequests", {
        periodInMinutes: 0.0833, // 5 seconds
    });
});
// Handle the alarm when it fires
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === "sendConnectionRequests") {
        sendConnectionRequests();
    }
});
function sendConnectionRequests() {
    var dbName = "LinkedInLeadsDB";
    var open = indexedDB.open(dbName, 1);
    open.onupgradeneeded = function (event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains("leads")) {
            db.createObjectStore("leads", { keyPath: "profileLink" });
        }
    };
    open.onerror = function (event) {
        console.error("Error opening database:", event);
    };
    open.onsuccess = function (event) {
        var db = event.target.result;
        console.log("DB", db);
        var transaction = db.transaction(["leads"], "readonly");
        transaction.oncomplete = function (event) {
            console.log("Transaction completed");
        };
        transaction.onerror = function (event) {
            console.error("Transaction error:", event);
        };
        var objectStore = transaction.objectStore("leads");
        var countRequest = objectStore.count();
        countRequest.onsuccess = function (event) {
            console.log("Number of records in object store:", event.target.result);
        };
        // Retrieve data from the object store
        var request = objectStore.getAll();
        console.log("request", request);
        request.onsuccess = function (event) {
            var leads = event.target.result;
            console.log("Leads from IndexedDB:", leads.length);
            // connection request logic here
        };
        request.onerror = function (event) {
            console.error("Error retrieving leads from object store:", event);
        };
    };
}
