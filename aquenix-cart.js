
/* =====================================================
   AQUENIX CART + HOMEPAGE CUSTOMER IDENTIFICATION
   Test branch only. Demo checkout — no live payments.
   ===================================================== */

(function () {
  "use strict";

  const SHEET_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbyTr1d5oHLsrjDNqnPd7C5WYkkS5p1m0H13VJfgjTW1_mc4SgS9CUFEEcHiTRZZ-MNp/exec";

  const PRODUCTS = {
    "01": { name: "Foaming Handwash", price: 149 },
    "02": { name: "Floor Cleaner", price: 179 },
    "03": { name: "Toilet Cleaner", price: 179 },
    "04": { name: "Bathroom Cleaner", price: 179 },
    "05": { name: "Glass & Mirror Cleaner", price: 169 },
    "06": { name: "Kitchen Cleaner", price: 179 },
    "07": { name: "Multi-Surface Cleaner", price: 189 },
    "08": { name: "Dishwash", price: 169 },
    "09": { name: "Tap/Limescale Cleaner", price: 199 },
    "10": { name: "Laundry Detergent", price: 229 },
    "11": { name: "Air Freshener", price: 189 },
    "12": { name: "Odour Eliminator", price: 199 },
    "13": { name: "Washing-machine Cleaner", price: 219 },
    "14": { name: "Stain Remover", price: 179 },
    "15": { name: "Vehicle Cleaner", price: 199 }
  };

  const LOCKED_MESSAGE =
    "Pehle Starter Kit se Suru Kare, Product aapke mutabik kaam kr rha he ki nahi vo dekhe fir refill apply kare, Dhanyawad ";

  const STORAGE_KEY = "aquenix_customer_lookup_v1";

  let cart = [];
  let verified = false;
  let sessionToken = "";
  let customerMobile = "";
  let customerName = "";
  let customerType = "Household";
  let starterKitPurchases = {};
  let customerStatus = "";
  let otpSent = false;
  let registrationDetails = null;
  let busy = false;
  let toastTimer = null;

  // ---------------------------------------------------
  // JSONP CONNECTION
  // ---------------------------------------------------

  function jsonp(action, data) {
    return new Promise(function (resolve, reject) {
      const callbackName =
        "aqCallback_" + Date.now() + "_" +
        Math.floor(Math.random() * 100000);

      const script = document.createElement("script");
      const params = new URLSearchParams();

      params.set("action", action);
      params.set("callback", callbackName);

      Object.keys(data || {}).forEach(function (key) {
        const value = data[key];
        params.set(
          key,
          typeof value === "string" ? value : JSON.stringify(value)
        );
      });

      let finished = false;

      const timeout = setTimeout(function () {
        finish();
        reject(new Error("Server did not respond. Please try again."));
      }, 25000);

      function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[callbackName] = function (response) {
        finish();

        if (!response || response.success !== true) {
          reject(new Error(
            response && response.message
              ? response.message
              : "Request failed."
          ));
          return;
        }

        resolve(response);
      };

      script.onerror = function () {
        finish();
        reject(new Error(
          "Unable to connect to AQUENIX server. Please try again."
        ));
      };

      script.src = SHEET_ENDPOINT + "?" + params.toString();
      document.body.appendChild(script);
    });
  }

  // ---------------------------------------------------
  // CUSTOMER LOOKUP STATE
  // ---------------------------------------------------

  function cleanPurchaseFlags(flags) {
    const clean = {};

    Object.keys(PRODUCTS).forEach(function (id) {
      clean[id] = !!(flags && flags[id] === true);
    });

    return clean;
  }

  function saveLookupSession() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        mobile: customerMobile,
        status: customerStatus,
        purchases: starterKitPurchases
      }));
    } catch (error) {
      // The current page session still works if storage is unavailable.
    }
  }

  function restoreLookupSession() {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(STORAGE_KEY) || "null"
      );

      if (!saved || !/^[6-9][0-9]{9}$/.test(saved.mobile || "")) {
        return;
      }

      customerMobile = saved.mobile;
      customerStatus = saved.status || "";
      starterKitPurchases = cleanPurchaseFlags(saved.purchases);

      updateWelcomePanel();
    } catch (error) {
      // Ignore invalid or unavailable session storage.
    }
  }

  async function lookupHomepageCustomer() {
    const input = document.getElementById("aq-home-mobile");
    const message = document.getElementById("aq-home-message");
    const button = document.getElementById("aq-home-identify");

    if (!input || !message || busy) return;

    const mobile = input.value.trim();

    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      message.textContent = "Enter a valid 10-digit Indian mobile number.";
      message.className = "aq-home-message aq-error";
      return;
    }

    busy = true;
    button.disabled = true;
    message.textContent = "Checking your AQUENIX account...";
    message.className = "aq-home-message";

    try {
      const response = await jsonp("checkCustomer", {
        mobile: mobile
      });

      customerMobile = mobile;
      customerStatus = response.existing ? "existing" : "new";

      starterKitPurchases = response.existing
        ? cleanPurchaseFlags(response.starterKitPurchases)
        : cleanPurchaseFlags({});

      saveLookupSession();
      updateWelcomePanel();
      refreshRefillAccess();

      message.textContent = response.existing
        ? "Welcome back! Your eligible refills are now available."
        : "Welcome to AQUENIX! Please choose a Starter Kit first.";

      message.className = "aq-home-message aq-success";

    } catch (error) {
      message.textContent = error.message;
      message.className = "aq-home-message aq-error";
    } finally {
      busy = false;
      button.disabled = false;
    }
  }

  function updateWelcomePanel() {
    const status = document.getElementById("aq-home-status");
    const input = document.getElementById("aq-home-mobile");
    const message = document.getElementById("aq-home-message");

    if (!status) return;

    if (customerMobile && customerStatus === "existing") {
      status.textContent =
        "Welcome back! Your matching purchased Starter Kit refills are unlocked.";

      if (input) input.value = customerMobile;

    } else if (customerMobile && customerStatus === "new") {
      status.textContent =
        "Welcome to AQUENIX! Starter Kits are available. Refills unlock after a matching Starter Kit purchase.";

      if (input) input.value = customerMobile;

    } else {
      status.textContent =
        "Enter your mobile number to check your AQUENIX refill access.";
    }

    if (message && !message.textContent) {
      message.textContent = "";
    }
  }

  function openWelcomePanel() {
    const panel = document.getElementById("aq-home-welcome");
    if (!panel) return;

    panel.hidden = false;

    const input = document.getElementById("aq-home-mobile");
    if (input) {
      input.focus();
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function closeWelcomePanel() {
    const panel = document.getElementById("aq-home-welcome");
    if (panel) panel.hidden = true;
  }

  // ---------------------------------------------------
  // WELCOME PANEL ON HOMEPAGE
  // ---------------------------------------------------

  function createWelcomePanel() {
    if (document.getElementById("aq-home-welcome")) return;

    const productsSection = document.querySelector("#products .wrap");
    if (!productsSection) return;

    const panel = document.createElement("div");
    panel.id = "aq-home-welcome";

    panel.innerHTML = `
      <div class="aq-home-panel-heading">
        <div>
          <strong>Welcome to AQUENIX</strong>
          <p id="aq-home-status">
            Enter your mobile number to check your refill access.
          </p>
        </div>
        <button type="button" id="aq-home-dismiss"
          aria-label="Close welcome panel">×</button>
      </div>

      <div class="aq-home-panel-controls">
        <label for="aq-home-mobile">Mobile Number</label>
        <input id="aq-home-mobile"
          type="tel"
          maxlength="10"
          inputmode="numeric"
          placeholder="Enter 10-digit mobile number">

        <button type="button" id="aq-home-identify">
          Check My Refills
        </button>
      </div>

      <p id="aq-home-message" class="aq-home-message" role="status"></p>

      <button type="button" id="aq-home-later">
        Do this later
      </button>
    `;

    productsSection.insertBefore(
      panel,
      productsSection.firstChild
    );

    document.getElementById("aq-home-identify")
      .addEventListener("click", lookupHomepageCustomer);

    document.getElementById("aq-home-mobile")
      .addEventListener("keydown", function (event) {
        if (event.key === "Enter") lookupHomepageCustomer();
      });

    document.getElementById("aq-home-dismiss")
      .addEventListener("click", closeWelcomePanel);

    document.getElementById("aq-home-later")
      .addEventListener("click", closeWelcomePanel);

    updateWelcomePanel();
  }

  function addWelcomeStyles() {
    if (document.getElementById("aq-home-welcome-styles")) return;

    const style = document.createElement("style");
    style.id = "aq-home-welcome-styles";

    style.textContent = `
      #aq-home-welcome {
        display:block;
        background:#fff;
        border:1px solid #dcebe7;
        border-radius:14px;
        padding:15px 18px;
        margin:0 0 22px;
        box-shadow:0 5px 18px rgba(10,50,42,.06);
      }

      #aq-home-welcome[hidden] {
        display:none !important;
      }

      .aq-home-panel-heading {
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:12px;
      }

      .aq-home-panel-heading strong {
        color:#073f3b;
        font-size:17px;
      }

      .aq-home-panel-heading p {
        color:#647772;
        font-size:13px;
        margin:3px 0 10px;
      }

      #aq-home-dismiss {
        border:0;
        background:transparent;
        color:#53645e;
        font-size:25px;
        cursor:pointer;
      }

      .aq-home-panel-controls {
        display:flex;
        align-items:center;
        flex-wrap:wrap;
        gap:9px;
      }

      .aq-home-panel-controls label {
        width:100%;
        font-size:12px;
        font-weight:700;
        color:#36564e;
      }

      #aq-home-mobile {
        flex:1;
        min-width:190px;
        padding:11px 13px;
        border:1px solid #cbd9d5;
        border-radius:7px;
        font-size:14px;
      }

      #aq-home-identify {
        padding:11px 16px;
        border:0;
        border-radius:7px;
        background:#087f75;
        color:white;
        font-weight:700;
        cursor:pointer;
      }

      #aq-home-identify:disabled {
        opacity:.6;
        cursor:wait;
      }

      .aq-home-message {
        min-height:0;
        margin:7px 0 0;
        font-size:13px;
      }

      .aq-home-message:empty {
        display:none;
      }

      .aq-home-message.aq-success {
        color:#087443;
      }

      .aq-home-message.aq-error {
        color:#b42318;
      }

      #aq-home-later {
        margin-top:7px;
        padding:3px 0;
        border:0;
        background:transparent;
        color:#647772;
        font-size:12px;
        text-decoration:underline;
        cursor:pointer;
      }

      #aq-locked-toast {
        position:fixed;
        left:50%;
        bottom:25px;
        transform:translateX(-50%);
        z-index:1000002;
        width:min(560px,calc(100% - 28px));
        padding:15px 18px;
        background:#073f3b;
        color:#fff;
        border-radius:10px;
        box-shadow:0 8px 30px rgba(0,0,0,.25);
        font-size:14px;
        line-height:1.6;
        text-align:center;
        display:none;
      }

      #aq-locked-toast.aq-toast-visible {
        display:block;
      }

      @media(max-width:520px) {
        .aq-home-panel-controls {
          align-items:stretch;
          flex-direction:column;
        }

        #aq-home-mobile,
        #aq-home-identify {
          width:100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ---------------------------------------------------
  // LOCKED REFILL MESSAGE
  // ---------------------------------------------------

  function showLockedMessage() {
    let toast = document.getElementById("aq-locked-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "aq-locked-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }

    toast.textContent = LOCKED_MESSAGE;
    toast.classList.add("aq-toast-visible");

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
      toast.classList.remove("aq-toast-visible");
    }, 4000);
  }

  // ---------------------------------------------------
  // CART FUNCTIONS
  // ---------------------------------------------------

  function getProduct(id) {
    return PRODUCTS[String(id)];
  }

  function getCartTotal() {
    return cart.reduce(function (total, item) {
      const product = getProduct(item.id);
      return total + (product.price * item.qty);
    }, 0);
  }

  function getCartCount() {
    return cart.reduce(function (total, item) {
      return total + item.qty;
    }, 0);
  }

  function hasStarterInCart(id) {
    return cart.some(function (item) {
      return item.id === String(id) && item.kit === "starter";
    });
  }

  function canUseRefill(id) {
    id = String(id);

    return starterKitPurchases[id] === true ||
      hasStarterInCart(id);
  }

  function refreshRefillAccess() {
    if (typeof window.aqRefreshDetailRefill === "function") {
      window.aqRefreshDetailRefill();
    }
  }

  function addProduct(id, kit) {
    id = String(id);
    kit = String(kit || "starter").toLowerCase();

    if (!getProduct(id)) {
      alert("Product not found.");
      return;
    }

    if (kit !== "starter" && kit !== "refill") {
      kit = "starter";
    }

    if (kit === "refill" && !canUseRefill(id)) {
      showLockedMessage();
      openWelcomePanel();
      return;
    }

    const existing = cart.find(function (item) {
      return item.id === id && item.kit === kit;
    });

    if (existing) {
      existing.qty = Math.min(existing.qty + 1, 99);
    } else {
      cart.push({
        id: id,
        kit: kit,
        qty: 1
      });
    }

    renderCart();
    refreshRefillAccess();
    openCart();
  }

  function changeQuantity(id, kit, change) {
    const item = cart.find(function (entry) {
      return entry.id === id && entry.kit === kit;
    });

    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
      cart = cart.filter(function (entry) {
        return !(entry.id === id && entry.kit === kit);
      });
    }

    if (item.qty > 99) item.qty = 99;

    renderCart();
    refreshRefillAccess();
  }

  function removeItem(id, kit) {
    cart = cart.filter(function (item) {
      return !(item.id === id && item.kit === kit);
    });

    renderCart();
    refreshRefillAccess();
  }

  function clearCart() {
    if (!cart.length) return;

    if (!confirm("Clear all items from your cart?")) return;

    cart = [];
    renderCart();
    refreshRefillAccess();
  }

  // Public storefront functions.
  window.aqAddProduct = addProduct;
  window.aqCanUseRefill = canUseRefill;
  window.aqOpenWelcomePanel = openWelcomePanel;
  window.aqRefreshDetailRefill = refreshRefillAccess;

  // ---------------------------------------------------
  // CART PANEL
  // ---------------------------------------------------

  function createPanel() {
    if (document.getElementById("aq-cart-panel")) return;

    const panel = document.createElement("div");
    panel.id = "aq-cart-panel";

    panel.innerHTML = `
      <div class="aq-cart-overlay"></div>

      <div class="aq-cart-box">
        <div class="aq-cart-heading">
          <strong>AQUENIX Your Cart</strong>
          <button type="button" id="aq-close-cart">×</button>
        </div>

        <div id="aq-cart-items"></div>

        <div class="aq-cart-total">
          <span>Total</span>
          <strong id="aq-cart-total">₹0</strong>
        </div>

        <button type="button" id="aq-clear-cart" class="aq-secondary">
          Clear Cart
        </button>

        <button type="button" id="aq-checkout" class="aq-primary">
          Continue to Checkout
        </button>

        <div id="aq-customer-area"></div>

        <p class="aq-demo-note">
          Demo checkout only. No payment will be collected.
        </p>

        <div id="aq-cart-message" role="status"></div>
      </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector(".aq-cart-overlay").addEventListener(
      "click", closeCart
    );

    document.getElementById("aq-close-cart").addEventListener(
      "click", closeCart
    );

    document.getElementById("aq-clear-cart").addEventListener(
      "click", clearCart
    );

    document.getElementById("aq-checkout").addEventListener(
      "click", beginCustomerProcess
    );
  }

  // ---------------------------------------------------
  // CART STYLES
  // ---------------------------------------------------

  function addCartStyles() {
    if (document.getElementById("aq-cart-styles")) return;

    const style = document.createElement("style");
    style.id = "aq-cart-styles";

    style.textContent = `
      #aq-cart-panel {
        display:none;
        position:fixed;
        inset:0;
        z-index:999999;
        font-family:Arial,sans-serif;
      }

      #aq-cart-panel.aq-open {
        display:block;
      }

      .aq-cart-overlay {
        position:absolute;
        inset:0;
        background:rgba(0,0,0,.55);
      }

      .aq-cart-box {
        position:absolute;
        right:0;
        top:0;
        height:100%;
        width:min(440px,100%);
        box-sizing:border-box;
        background:#fff;
        padding:20px;
        overflow-y:auto;
        box-shadow:-5px 0 25px rgba(0,0,0,.15);
      }

      .aq-cart-heading {
        display:flex;
        justify-content:space-between;
        align-items:center;
        font-size:20px;
        padding-bottom:16px;
        border-bottom:1px solid #ddd;
      }

      #aq-close-cart {
        border:0;
        background:none;
        font-size:30px;
        cursor:pointer;
      }

      .aq-cart-item {
        padding:14px 0;
        border-bottom:1px solid #eee;
      }

      .aq-cart-item-title {
        font-weight:bold;
        margin-bottom:6px;
      }

      .aq-cart-item-meta {
        color:#555;
        font-size:14px;
        margin-bottom:8px;
      }

      .aq-cart-item-actions {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:8px;
      }

      .aq-quantity button {
        padding:5px 11px;
        margin:0 4px;
        cursor:pointer;
      }

      .aq-remove {
        border:0;
        background:none;
        color:#b42318;
        cursor:pointer;
      }

      .aq-cart-total {
        display:flex;
        justify-content:space-between;
        font-size:19px;
        padding:18px 0;
      }

      .aq-primary,.aq-secondary {
        width:100%;
        padding:13px;
        margin:7px 0;
        border-radius:6px;
        cursor:pointer;
        font-size:15px;
      }

      .aq-primary {
        background:#087f8c;
        color:#fff;
        border:0;
      }

      .aq-secondary {
        background:#fff;
        color:#333;
        border:1px solid #ccc;
      }

      .aq-form {
        margin-top:18px;
        padding-top:15px;
        border-top:1px solid #ddd;
      }

      .aq-form h3 {
        margin:0 0 12px;
      }

      .aq-form label {
        display:block;
        margin:10px 0 5px;
        font-size:14px;
      }

      .aq-form input {
        width:100%;
        box-sizing:border-box;
        padding:12px;
        border:1px solid #bbb;
        border-radius:5px;
        font-size:15px;
      }

      .aq-form button {
        margin-top:12px;
      }

      .aq-demo-note {
        font-size:12px;
        color:#666;
        text-align:center;
      }

      #aq-cart-message {
        margin-top:12px;
        font-size:14px;
        line-height:1.5;
      }

      .aq-success { color:#087443; }
      .aq-error { color:#b42318; }
      .aq-muted { color:#666; font-size:13px; }

      @media(max-width:480px) {
        .aq-cart-box {
          width:100%;
          padding:16px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // ---------------------------------------------------
  // CART DISPLAY
  // ---------------------------------------------------

  function renderCart() {
    createPanel();

    const list = document.getElementById("aq-cart-items");
    const total = document.getElementById("aq-cart-total");

    if (!cart.length) {
      list.innerHTML =
        '<p class="aq-muted">Your cart is empty.</p>';
    } else {
      list.innerHTML = cart.map(function (item) {
        const product = getProduct(item.id);
        const kitName =
          item.kit === "starter" ? "Starter Kit" : "Refill";

        return `
          <div class="aq-cart-item">
            <div class="aq-cart-item-title">
              ${escapeHtml(product.name)}
            </div>

            <div class="aq-cart-item-meta">
              ${kitName} · ₹${product.price} each
            </div>

            <div class="aq-cart-item-actions">
              <div class="aq-quantity">
                <button type="button"
                  data-action="minus"
                  data-id="${item.id}"
                  data-kit="${item.kit}">−</button>

                ${item.qty}

                <button type="button"
                  data-action="plus"
                  data-id="${item.id}"
                  data-kit="${item.kit}">+</button>
              </div>

              <strong>₹${product.price * item.qty}</strong>

              <button type="button"
                class="aq-remove"
                data-action="remove"
                data-id="${item.id}"
                data-kit="${item.kit}">Remove</button>
            </div>
          </div>
        `;
      }).join("");
    }

    total.textContent = "₹" + getCartTotal();

    list.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        const id = button.dataset.id;
        const kit = button.dataset.kit;
        const action = button.dataset.action;

        if (action === "plus") changeQuantity(id, kit, 1);
        if (action === "minus") changeQuantity(id, kit, -1);
        if (action === "remove") removeItem(id, kit);
      });
    });

    updateCartCount();
  }

  function openCart() {
    createPanel();
    renderCart();

    document.getElementById("aq-cart-panel")
      .classList.add("aq-open");
  }

  function closeCart() {
    const panel = document.getElementById("aq-cart-panel");
    if (panel) panel.classList.remove("aq-open");
  }

  function showMessage(message, isError) {
    const box = document.getElementById("aq-cart-message");
    if (!box) return;

    box.className = isError ? "aq-error" : "aq-success";
    box.textContent = message;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  // ---------------------------------------------------
  // CHECKOUT CUSTOMER IDENTIFICATION
  // Existing email OTP flow is preserved.
  // ---------------------------------------------------

  function beginCustomerProcess() {
    if (busy) return;

    if (!cart.length) {
      showMessage("Your cart is empty.", true);
      return;
    }

    if (verified && sessionToken) {
      saveDemoCheckout();
      return;
    }

    showCustomerForm();
  }

  function showCustomerForm() {
    const area = document.getElementById("aq-customer-area");

    area.innerHTML = `
      <div class="aq-form">
        <h3>Customer Details</h3>

        <p class="aq-muted">
          Enter your mobile number to continue checkout.
        </p>

        <label for="aq-mobile">Mobile Number</label>
        <input id="aq-mobile"
          type="tel"
          maxlength="10"
          inputmode="numeric"
          placeholder="10-digit mobile number">

        <button type="button" id="aq-identify"
          class="aq-primary">
          Continue
        </button>

        <div id="aq-registration-area"></div>
      </div>
    `;

    document.getElementById("aq-identify")
      .addEventListener("click", identifyCustomer);
  }

  async function identifyCustomer() {
    if (busy) return;

    const mobile = document.getElementById("aq-mobile")
      .value.trim();

    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      showMessage("Enter a valid 10-digit Indian mobile number.", true);
      return;
    }

    busy = true;
    showMessage("Checking customer details...", false);

    try {
      const response = await jsonp("checkCustomer", {
        mobile: mobile
      });

      customerMobile = mobile;
      customerStatus = response.existing ? "existing" : "new";

      if (response.existing) {
        showExistingCustomerForm();
        showMessage(
          "Namaste! Welcome back to AQUENIX. Please verify your email before checkout.",
          false
        );
      } else {
        showNewCustomerForm();
        showMessage(
          "Welcome to AQUENIX! Please complete your registration.",
          false
        );
      }

    } catch (error) {
      showMessage(error.message, true);
    } finally {
      busy = false;
    }
  }

  // ---------------------------------------------------
  // EXISTING CUSTOMER
  // ---------------------------------------------------

  function showExistingCustomerForm() {
    const area = document.getElementById("aq-registration-area");

    area.innerHTML = `
      <div class="aq-form">
        <h3>Welcome Back!</h3>

        <p class="aq-muted">
          Your verification code will be sent to your registered email address.
        </p>

        <button type="button" id="aq-send-otp"
          class="aq-primary">
          Send Email OTP
        </button>

        <div id="aq-otp-area"></div>
      </div>
    `;

    document.getElementById("aq-send-otp")
      .addEventListener("click", sendCustomerOtp);
  }

  // ---------------------------------------------------
  // NEW CUSTOMER REGISTRATION
  // ---------------------------------------------------

  function showNewCustomerForm() {
    const area = document.getElementById("aq-registration-area");

    area.innerHTML = `
      <div class="aq-form">
        <h3>New Customer Registration</h3>

        <label for="aq-name">Full Name</label>
        <input id="aq-name" type="text"
          placeholder="Enter your full name">

        <label for="aq-email">Email Address</label>
        <input id="aq-email" type="email"
          placeholder="Enter your email">

        <label for="aq-city">City</label>
        <input id="aq-city" type="text"
          placeholder="Enter your city">

        <button type="button" id="aq-register-otp"
          class="aq-primary">
          Register and Send OTP
        </button>

        <div id="aq-otp-area"></div>
      </div>
    `;

    document.getElementById("aq-register-otp")
      .addEventListener("click", function () {
        const fullName =
          document.getElementById("aq-name").value.trim();

        const email =
          document.getElementById("aq-email").value.trim();

        const city =
          document.getElementById("aq-city").value.trim();

        if (!fullName || !email || !city) {
          showMessage("Please enter your name, email and city.", true);
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showMessage("Enter a valid email address.", true);
          return;
        }

        registrationDetails = {
          fullName: fullName,
          email: email,
          city: city,
          customerType: "Household"
        };

        sendCustomerOtp();
      });
  }

  // ---------------------------------------------------
  // SEND OTP
  // ---------------------------------------------------

  async function sendCustomerOtp() {
    if (busy) return;

    busy = true;
    showMessage("Sending verification code...", false);

    try {
      const data = {
        mobile: customerMobile
      };

      if (customerStatus === "new") {
        if (!registrationDetails) {
          throw new Error("Please complete registration first.");
        }

        data.fullName = registrationDetails.fullName;
        data.email = registrationDetails.email;
        data.city = registrationDetails.city;
        data.customerType = "Household";
      }

      const response = await jsonp("sendOtp", data);

      otpSent = true;
      showOtpForm(response.maskedEmail);

      showMessage(
        "Verification code sent to " + response.maskedEmail,
        false
      );

    } catch (error) {
      showMessage(error.message, true);
    } finally {
      busy = false;
    }
  }

  // ---------------------------------------------------
  // OTP FORM
  // ---------------------------------------------------

  function showOtpForm(maskedEmail) {
    const area = document.getElementById("aq-otp-area");

    area.innerHTML = `
      <div class="aq-form">
        <p class="aq-muted">
          Enter the 6-digit code sent to ${escapeHtml(maskedEmail || "your email")}.
        </p>

        <label for="aq-otp">Email Verification Code</label>
        <input id="aq-otp"
          type="text"
          maxlength="6"
          inputmode="numeric"
          placeholder="Enter 6-digit OTP">

        <button type="button" id="aq-verify-otp"
          class="aq-primary">
          Verify OTP
        </button>
      </div>
    `;

    document.getElementById("aq-verify-otp")
      .addEventListener("click", verifyCustomerOtp);
  }

  // ---------------------------------------------------
  // VERIFY OTP
  // ---------------------------------------------------

  async function verifyCustomerOtp() {
    if (busy) return;

    const otp = document.getElementById("aq-otp")
      .value.trim();

    if (!/^[0-9]{6}$/.test(otp)) {
      showMessage("Enter the 6-digit verification code.", true);
      return;
    }

    busy = true;
    showMessage("Verifying your email...", false);

    try {
      const response = await jsonp("verifyOtp", {
        mobile: customerMobile,
        otp: otp
      });

      if (!response.verified || !response.sessionToken) {
        throw new Error("Verification failed. Please try again.");
      }

      verified = true;
      sessionToken = response.sessionToken;
      customerName = response.customerName || "";
      starterKitPurchases = cleanPurchaseFlags(
        response.starterKitPurchases || {}
      );

      customerStatus = response.existing ? "existing" : "new";
      saveLookupSession();
      updateWelcomePanel();

      document.getElementById("aq-customer-area").innerHTML = `
        <div class="aq-form">
          <h3>Verification Successful</h3>
          <p class="aq-success">
            ${escapeHtml(response.message || "Your email is verified.")}
          </p>
          <p class="aq-muted">
            You can now continue to demo checkout.
          </p>
        </div>
      `;

      showMessage("Email verified successfully.", false);
      renderCart();
      refreshRefillAccess();

    } catch (error) {
      showMessage(error.message, true);
    } finally {
      busy = false;
    }
  }

  // ---------------------------------------------------
  // SAVE DEMO CHECKOUT
  // ---------------------------------------------------

  async function saveDemoCheckout() {
    if (busy) return;

    if (!verified || !sessionToken) {
      showMessage("Please verify your email first.", true);
      return;
    }

    if (!cart.length) {
      showMessage("Your cart is empty.", true);
      return;
    }

    busy = true;
    showMessage("Recording your demo checkout...", false);

    const items = cart.map(function (item) {
      return {
        id: item.id,
        kit: item.kit,
        qty: item.qty
      };
    });

    try {
      const response = await jsonp("saveCheckout", {
        sessionToken: sessionToken,
        items: items
      });

      if (!response.success) {
        throw new Error("Unable to record checkout.");
      }

      document.getElementById("aq-customer-area").innerHTML = `
        <div class="aq-form">
          <h3>Demo Checkout Recorded</h3>

          <p class="aq-success">
            Thank you${customerName ? ", " + escapeHtml(customerName) : ""}!
          </p>

          <p>
            Reference: <strong>${escapeHtml(response.checkoutRef || "")}</strong>
          </p>

          <p class="aq-muted">
            Status: Demo Checkout - Not Paid
          </p>

          <p class="aq-muted">
            No payment has been collected. This is a demonstration only.
          </p>
        </div>
      `;

      showMessage(
        "Your demo checkout has been recorded successfully.",
        false
      );

      cart = [];
      renderCart();
      refreshRefillAccess();

      document.getElementById("aq-checkout").disabled = true;
      document.getElementById("aq-checkout").textContent =
        "Demo Checkout Completed";

    } catch (error) {
      showMessage(error.message, true);
    } finally {
      busy = false;
    }
  }

  // ---------------------------------------------------
  // CART BUTTON IN WEBSITE NAVIGATION
  // ---------------------------------------------------

  function addCartButton() {
    if (document.getElementById("aq-open-cart")) return;

    const button = document.createElement("button");
    button.id = "aq-open-cart";
    button.type = "button";
    button.innerHTML = "Cart (<span id='aq-cart-count'>0</span>)";

    button.style.cssText =
      "border:1px solid #087f8c;background:#087f8c;color:white;" +
      "padding:9px 14px;border-radius:6px;cursor:pointer;" +
      "font-size:14px;margin-left:10px;";

    button.addEventListener("click", openCart);

    const nav = document.querySelector("header nav") ||
      document.querySelector("nav");

    if (nav) {
      nav.appendChild(button);
    } else {
      document.body.appendChild(button);
    }
  }

  function updateCartCount() {
    const count = document.getElementById("aq-cart-count");
    if (count) count.textContent = getCartCount();
  }

  // ---------------------------------------------------
  // INITIALISE
  // ---------------------------------------------------

  function init() {
    addWelcomeStyles();
    addCartStyles();
    createPanel();
    createWelcomePanel();
    restoreLookupSession();
    addCartButton();
    renderCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
