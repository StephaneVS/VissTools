import { createElement } from "./dom.js";
import { wsCall } from "./jason.js";
import { shopList, vmList, version } from "./data.js";

let email = "";

/**
 * Calback for building shop admin buttons
 * @param {object} item list item
 * @returns {object} button text and link
 */
const shopButton = (item) => {
  if (item.hidden) return null;
  return {
    text: `B${item.id}`,
    link: `${item.url}/${item.admin}/index.php?controller=AdminLogin&redirect=AdminDashboard&email=${email}`,
  };
};

/**
 * Callback for building VM dashboards buttons
 * @param {object} item list item
 * @returns {object} button text and link
 */
const dashButton = (item) => {
  return {
    text: item.name,
    link: item.url.replace("https://", `https://${item.dashboard.user}:${item.dashboard.password}@`)
  };
};

/**
 * Load a bar of buttons
 * @param {HTMLElement} container parent element
 * @param {Array} list list of elements
 * @param {Function} callback function to build a button from list
 * @returns {void}
 */
function loadButtons(container, list, callback) {
  const buttons = document.querySelector(container);
  if (!buttons) return;
  list.forEach((item) => {
    const button = callback(item);
    if (!button) return;
    const link = createElement("a", button.text, {
      href: button.link,
      class: "btn btn-outline-light btn-sm",
      target: "_blank",
    });
    buttons.appendChild(link);
  });
}

/**
 * Return an object's property value
 * @param {object} o object to parse
 * @param {string} prop property name
 * @param {string} onError default value
 * @returns {string} property value or default
 */
function stringOrDefault(o, prop, onError = "") {
  return o[prop] || onError;
}

/**
 * Search order reference using Jason WS
 * @returns {void}
 */
async function searchOrder() {
  const psOrderId = document.querySelector("#psOrderId");
  if (!psOrderId) return;
  const orderRef = psOrderId.value;
  if (orderRef === "") {
    alert("Veuillez saisir un no de commande");
    return;
  }
  const result = document.querySelector("#orderResult");
  result.innerHTML = "Recherche...";

  const refcmdResult = await wsCall({ prg: "REFCMD", reference: orderRef });
  if (refcmdResult.hasOwnProperty("wsError")) {
    result.innerHTML = refcmdResult.wsError;
  } else {
    const attribs = { class: "list-group-item" };
    const shopId = parseInt(stringOrDefault(refcmdResult, "shop", "")) || 0;
    const idOrder = parseInt(stringOrDefault(refcmdResult, "order_id", "")) || 0;
    if (shopId === 0 || idOrder === 0) {
      result.innerHTML = '<p class="text-warning">Commande introuvable !</p>';
      return;
    }
    result.innerHTML = "";

    const shopInfo = shopList.find((shop) => shop.id === shopId);
    const orderUrl = `${shopInfo.url}/${shopInfo.admin}/index.php?controller=AdminOrders&id_order=${idOrder}&vieworder`;
    const tracking = stringOrDefault(refcmdResult, "tracking", "");
    const tracking_url = stringOrDefault(refcmdResult, "tracking_url", "");
    const relayId = stringOrDefault(refcmdResult, "relay_id", "");
    const mpOrderId = stringOrDefault(refcmdResult, "marketplace_id", "");
    const info = createElement("ul", "", {
      class: "list-group list-group-flush",
    });
    info.appendChild(
      createElement(
        "li",
        `No Prestashop : <a href="${orderUrl}" target="_blank">B${shopId} P${idOrder}</a>`,
        attribs
      )
    );
    info.appendChild(
      createElement(
        "li",
        `Etat : ${stringOrDefault(refcmdResult, "status", "")}`,
        attribs
      )
    );
    info.appendChild(
      createElement(
        "li",
        `Transporteur : ${stringOrDefault(refcmdResult, "carrier", "")}`,
        attribs
      )
    );
    let link;
    if (tracking_url !== "") {
      link = `<a href="${tracking_url}" target="_blank">${tracking}</a>`;
    }
    info.appendChild(
      createElement(
        "li",
        `No Suivi : ${ link ? link : tracking }`,
        attribs
      )
    );
    if (relayId !== "") {
      info.appendChild(
        createElement(
          "li",
          `No relais : ${ relayId.replaceAll("/!\\", "⚠️") }`,
          attribs
        )
      );
    }
    if (mpOrderId !== "") {
      info.appendChild(
        createElement(
          "li",
          `No Cmd Marketplace : ${ mpOrderId }`,
          attribs
        )
      );        
    }
    info.appendChild(
      createElement(
        "li",
        `AR No : ${stringOrDefault(refcmdResult, "ar", "")}`,
        attribs
      )
    );
    info.appendChild(
      createElement(
        "li",
        `Client No : ${stringOrDefault(refcmdResult, "ccl", "")}`,
        attribs
      )
    );
    const others = stringOrDefault(refcmdResult, "others", "");
    if (others !== "") {
      info.appendChild(
        createElement("li", `⚠️ Doublon : ${others} ⚠️`, attribs)
      );
    }
    result.appendChild(info);
  }
}

/**
 * Returns stock for reference
 * @returns {void}
 */
async function searchProduct() {
  const refProduct = document.querySelector("#refProduct");
  if (!refProduct) return;
  const reference = refProduct.value;
  if (reference.length !== 10) {
    alert("Veuillez saisir une référence produit valide");
    return;
  }
  const result = document.querySelector("#productResult");
  result.innerHTML = "Recherche...";

  let content = "";

  const stockReel = await wsCall({ prg: "stockreel", art: reference });
  if (stockReel.hasOwnProperty("wsError")) {
    content = stockReel.wsError;
  } else if (stockReel.result.toLowerCase() === "ko") {
    content = `<p class="text-warning">${stockReel.message}</p>`;
  } else {
    const stock = parseInt(stockReel.sr) || 0;
    const delay = parseInt(stockReel.delai) || 0;
    content = `Stock Réel <a href="https://www.vis-express.fr/r/${reference}" class="btn btn-dark btn-sm" title="Afficher sur la boutique" target="_blank"><i class="bi bi-shop"></i></a> : `;
    const color = stock > 0 ? "text-bg-success" : "text-bg-warning";
    content += (stock !== 0) 
      ? `<span class="badge rounded-pill ${color}">${stockReel.sr} pièces</span>` 
      : `<span class="badge rounded-pill ${color}">En rupture</span> (Délai : ${delay} jours)`;
    if (stockReel.packs) {
      content += " soit";
      stockReel.packs.forEach(pack => {
        if (pack.units > 1) 
          content += `&nbsp;<span class="badge rounded-pill text-bg-secondary">${pack.stock} x ${pack.units} pièces</span>`;
      });
    }
  }
  result.innerHTML = content;
}

/**
 * Get warehouse stocks
 */
async function getStock() {
  const stock = document.querySelector("#stock");
  const infoscreen = await wsCall({ prg: "INFOSCREEN" });
  if (infoscreen.hasOwnProperty("nbr_pieces_dsp")) {
    stock.innerHTML = `<strong>${infoscreen.nbr_pieces_dsp} pièces en entrepôt</strong>`;
  }
}

function optionsPage() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
}

/**
 * Main routine
 */

// Version label
document.querySelector("h1").title = `Version ${version}`;

// Get user preferences
chrome.storage.sync.get({
  email: "",
  checkCode: "",
  boBtnBar: false,
  dashBtnBar: false
}, function(options) {

  if (options.boBtnBar) loadButtons("#boButtons", shopList, shopButton);
  else document.querySelector("#backOffice").style.display = "none";
  
  if (options.dashBtnBar) loadButtons("#dashButtons", vmList, dashButton);
  else document.querySelector("#dashBoard").style.display = "none";
});

// Get total units in warehouse
await getStock();

// Wire-up events
document
  .querySelector("#searchOrderBtn")
  .addEventListener("click", searchOrder);

document
  .querySelector("#searchProductBtn")
  .addEventListener("click", searchProduct);

document
  .querySelector("#optionsBtn")
  .addEventListener("click", optionsPage);