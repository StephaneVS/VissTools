/**
 * Create DOM element
 * @param {string} type - Element type
 * @param {string} content - Element content
 * @param {object} [attributes={}] - Element attributes
 * @returns {HTMLElement}
 */
const createElement = (type, content, attributes = {}) => {
  const element = document.createElement(type);
  for (const [attribute, value] of Object.entries(attributes)) {
    element.setAttribute(attribute, value);
  }
  if (content && content.length > 0) {
    if (content.charAt(0) === "<") element.innerText = content;
    else element.innerHTML = content;
  }
  return element;
};

export { createElement };

/**
 * Clear child elements
 * @param {HTMLElement} container - HTML element to clear
 */
const clearContent = (container) => {
  while (container.childNodes.length > 0) {
    container.removeChild(container.childNodes[0]);
  }
};

export { clearContent };

/**
 * Clear alerts element
 * @param {HTMLElement|null} alert - Alerts UI element
 */
function clearAlert(alert) {
  if (!alert) alert = document.querySelector("#alerts");
  clearContent(alert);
}

/**
 * Display a flash message
 * @param {string} message - Message to display
 * @param {string} color - Special color code for alert-* class
 * @param {number} [timeoutSeconds=5] - Delay before clear alert (defaults to 5 secs)
 */
export function flash(message, color, timeoutSeconds = 5) {
  const flashMessage = createElement("div", message, {
    class: `alert alert-${color} m-3 col-9 text-center`,
    role: "alert",
  });
  const alert = document.querySelector("#alerts");
  alert.appendChild(flashMessage);
  setTimeout(() => {
    clearAlert();
  }, timeoutSeconds * 1000);
}

/**
 * Return UI element value
 * @param {string} selector - CSS selector
 * @returns {string}
 */
export function getValue(selector) {
  return document.querySelector(selector).value;
}

/**
 * Return UI element checked state
 * @param {string} selector - CSS selector
 * @returns {boolean}
 */
export function getChecked(selector) {
  return document.querySelector(selector).checked;
}

/**
 * Set a UI element value
 * @param {string} selector - CSS selector
 * @param {string} [value=""] - Value to set
 */
export function setValue(selector, value = "") {
  document.querySelector(selector).value = value;
}

/**
 * Set a UI element checked state
 * @param {string} selector - CSS selector
 * @param {boolean} [checked=false] - State to set
 */
export function setChecked(selector, checked = false) {
  document.querySelector(selector).checked = checked;
}