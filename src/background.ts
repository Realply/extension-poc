// Open or create the IndexedDB database
var request = indexedDB.open("LinkedInLeadsDB", 1);

request.onerror = function (event: any) {
  console.error("Database error: " + event.target.errorCode);
};

request.onupgradeneeded = function (event: any) {
  var db = event.target.result;
  var objectStore = db.createObjectStore("leads", {
    keyPath: "profileLink",
    autoIncrement: true,
  });
};

request.onsuccess = function (event: any) {
  var db = event.target.result;

  // Function to retrieve all data from the object store
  function getAllData() {
    var transaction = db.transaction(["leads"], "readonly");
    var objectStore = transaction.objectStore("leads");

    var getAllRequest = objectStore.openCursor();

    getAllRequest.onsuccess = function (event: any) {
      var cursor = event.target.result;
      if (cursor) {
        var data = cursor.value;
        console.log("Retrieved data:", data);
        const profileUrn = "urn:li:fsd_profile" + data.profileUrn;
        sendConnectionRequest(profileUrn);
        cursor.continue();
      } else {
        console.log("No more data!");
      }
    };

    getAllRequest.onerror = function (event: any) {
      console.error("Error getting data: " + event.target.errorCode);
    };
  }

  // Set up a timer to automatically retrieve data every 10 seconds
  setInterval(function () {
    getAllData();
  }, 10000);

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "startCampaign") {
      console.log("Received leadsData:", request.leadsData);
      // Add received leadsData to the object store
      var transaction = db.transaction(["leads"], "readwrite");
      var objectStore = transaction.objectStore("leads");

      request.leadsData.forEach((leadData: any) => {
        var addRequest = objectStore.add(leadData);

        addRequest.onsuccess = function () {
          console.log("Lead data added to IndexedDB");
        };

        addRequest.onerror = function (event: any) {
          console.error("Error adding lead data:", event.target.errorCode);
        };
      });
    } else if (request.action === "getData") {
      // Retrieve all data from the object store
      getAllData();
    }
  });
};

async function sendConnectionRequest(profileUrn: string) {
  try {
    const csrfToken = await getCsrfToken();
    const liAt = await getLiAtCookie();
    const customMessage = "Hello! Would love to connect with you.";

    const headers = new Headers({
      Accept: "application/vnd.linkedin.normalized+json+2.1",
      "Content-Type": "application/json; charset=UTF-8",
      "csrf-token": csrfToken,
      Cookie: `JSESSIONID=${csrfToken}; li_at=${liAt}`,
    });

    // commenting out the actual logic for sending connection requests
    // const response = await fetch(
    //   "https://www.linkedin.com/voyager/api/voyagerRelationshipsDashMemberRelationships?action=verifyQuotaAndCreateV2&decorationId=com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee-2",
    //   {
    //     method: "POST",
    //     headers: headers,
    //     body: JSON.stringify({
    //       invitee: {
    //         inviteeUnion: {
    //           memberProfile: profileUrn,
    //         },
    //       },
    //       customMessage: customMessage,
    //     }),
    //   }
    // );

    // const data = await response.json();
    // console.log("Connection request sent successfully:", data);

    console.log("Connection request sent succesfully", profileUrn);
  } catch (error) {
    console.error("Error sending connection request:", error);
  }
}

async function getCsrfToken() {
  const domain = "www.linkedin.com";
  const name = "JSESSIONID";

  return new Promise<string>((resolve, reject) => {
    chrome.cookies.get({ url: `https://${domain}`, name }, function (cookie) {
      if (cookie) {
        const csrfToken = cookie.value;
        resolve(csrfToken);
      } else {
        console.error("Cookie not found");
        reject("Cookie not found");
      }
    });
  });
}

async function getLiAtCookie() {
  const domain = "www.linkedin.com";
  const name = "li_at";

  return new Promise<string>((resolve, reject) => {
    chrome.cookies.get({ url: `https://${domain}`, name }, function (cookie) {
      if (cookie) {
        const liAt = cookie.value;
        resolve(liAt);
      } else {
        console.error("Cookie not found");
        reject("Cookie not found");
      }
    });
  });
}
