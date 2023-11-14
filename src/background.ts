chrome.runtime.onInstalled.addListener(() => {
  // Schedule a job to send connection requests every 5 seconds for testing
  chrome.alarms.create("sendConnectionRequests", {
    periodInMinutes: 0.0833, // 5 seconds
  });
});

// Handle the alarm when it fires
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "sendConnectionRequests") {
    sendConnectionRequests();
  }
});

function sendConnectionRequests() {
  const dbName = "LinkedInLeadsDB";
  const open = indexedDB.open(dbName, 1);

  open.onupgradeneeded = function (event) {
    const db = (event.target as any).result;
    if (!db.objectStoreNames.contains("leads")) {
      db.createObjectStore("leads", { keyPath: "profileLink" });
    }
  };

  open.onerror = function (event) {
    console.error("Error opening database:", event);
  };

  open.onsuccess = function (event) {
    const db = (event.target as any).result;
    console.log("DB", db);

    const transaction = db.transaction(["leads"], "readonly");

    transaction.oncomplete = function (event: any) {
      console.log("Transaction completed");
    };

    transaction.onerror = function (event: any) {
      console.error("Transaction error:", event);
    };

    const objectStore = transaction.objectStore("leads");

    const countRequest = objectStore.count();

    countRequest.onsuccess = function (event: any) {
      console.log("Number of records in object store:", event.target.result);
    };

    // Retrieve data from the object store
    const request = objectStore.getAll();

    console.log("request", request);

    request.onsuccess = function (event: any) {
      const leads = (event.target as any).result;
      console.log("Leads from IndexedDB:", leads.length);
      // connection request logic here
    };

    request.onerror = function (event: any) {
      console.error("Error retrieving leads from object store:", event);
    };
  };
}
