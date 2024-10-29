import { getValue, setValue, getChecked, setChecked } from "./dom.js";
import { wsCall } from "./jason.js";
import { version } from "./data.js";

/**
 * Verify VS email 
 * @param {string} email Email to validate
 * @param {number} checkCode Verification code
 * @returns {Promise<boolean>}
 */
async function validateCode(email, checkCode) {
  if (email === "" || checkCode === 0) return false;
  if (!email.endsWith("@vis-express.fr") && !email.endsWith("@visserie-service.fr")) return false;
  
  const loginResult = await wsCall({ prg: "login", email });
  if (!loginResult.hasOwnProperty("ccl")) return false;
  
  return loginResult.ccl === checkCode;
}

/**
 * Load settings
 */
function loadSettings() {
  chrome.storage.sync.get({
    email: "",
    checkCode: "",
    boBtnBar: false,
    dashBtnBar: false
  }, function(options) {
    setValue("#email", options.email),
    setValue("#checkCode", options.checkCode);
    setChecked("#backofficeBtns", options.boBtnBar);
    setChecked("#dashboardBtns", options.dashBtnBar);
  });
}

/**
 * Save settings
 */
async function saveSettings() {
  const email = getValue("#email");
  const checkCode = parseInt(getValue("#checkCode")) || 0;
  let boBtnBar = getChecked("#backofficeBtns");
  let dashBtnBar = getChecked("#dashboardBtns");
  
  let statusText = "Options sauvegardées";
  let statusClass = "text-success";

  if (!await validateCode(email, checkCode)) {
    boBtnBar = false;
    dashBtnBar = false;
    statusText = "Email non vérifié";
    statusClass = "text-warning";
  }
  
  chrome.storage.sync.set({
    email: email,
    checkCode: checkCode,
    boBtnBar: boBtnBar,
    dashBtnBar: dashBtnBar
  }, function() {
    const status = document.querySelector("#saveStatus");
    status.classList.toggle(statusClass);
    status.textContent = statusText;
    setTimeout(function() {
      status.classList.toggle(statusClass);
      status.textContent = "";
    }, 1500);
  });
}

/**
 * Main routine
 */
document.querySelector(".version").textContent = `Version ${version}`;

loadSettings();

document
  .querySelector("#saveBtn")
  .addEventListener("click", saveSettings);