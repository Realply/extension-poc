"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
                var profileUrn = "urn:li:fsd_profile" + data.profileUrn;
                sendConnectionRequest(profileUrn);
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
    }, 10000);
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
function sendConnectionRequest(profileUrn) {
    return __awaiter(this, void 0, void 0, function () {
        var csrfToken, liAt, customMessage, headers, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getCsrfToken()];
                case 1:
                    csrfToken = _a.sent();
                    return [4 /*yield*/, getLiAtCookie()];
                case 2:
                    liAt = _a.sent();
                    customMessage = "Hello! Would love to connect with you.";
                    headers = new Headers({
                        Accept: "application/vnd.linkedin.normalized+json+2.1",
                        "Content-Type": "application/json; charset=UTF-8",
                        "csrf-token": csrfToken,
                        Cookie: "JSESSIONID=".concat(csrfToken, "; li_at=").concat(liAt),
                    });
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
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error sending connection request:", error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getCsrfToken() {
    return __awaiter(this, void 0, void 0, function () {
        var domain, name;
        return __generator(this, function (_a) {
            domain = "www.linkedin.com";
            name = "JSESSIONID";
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    chrome.cookies.get({ url: "https://".concat(domain), name: name }, function (cookie) {
                        if (cookie) {
                            var csrfToken = cookie.value;
                            resolve(csrfToken);
                        }
                        else {
                            console.error("Cookie not found");
                            reject("Cookie not found");
                        }
                    });
                })];
        });
    });
}
function getLiAtCookie() {
    return __awaiter(this, void 0, void 0, function () {
        var domain, name;
        return __generator(this, function (_a) {
            domain = "www.linkedin.com";
            name = "li_at";
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    chrome.cookies.get({ url: "https://".concat(domain), name: name }, function (cookie) {
                        if (cookie) {
                            var liAt = cookie.value;
                            resolve(liAt);
                        }
                        else {
                            console.error("Cookie not found");
                            reject("Cookie not found");
                        }
                    });
                })];
        });
    });
}
