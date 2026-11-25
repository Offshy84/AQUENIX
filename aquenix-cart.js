
(() => {
  // AQUENIX WEBSITE
  // Categories + Separate Starter Kit / Refill Buttons
  // Cart + Email OTP + Product-specific refill eligibility
  // Google Sheet checkout logging
  // Demo checkout only. Live payments disabled.

  const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbyTr1d5oHLsrjDNqnPd7C5WYkkS5p1m0H13VJfgjTW1_mc4SgS9CUFEEcHiTRZZ-MNp/exec";

  // PRODUCT CATALOGUE
  const products = {
    "01": ["Foaming Handwash", "Personal Care"],
    "02": ["Floor Cleaner", "Home Care"],
    "03": ["Toilet Cleaner", "Home Care"],
    "04": ["Bathroom Cleaner", "Home Care"],
    "05": ["Glass & Mirror Cleaner", "Home Care"],
    "06": ["Kitchen Cleaner", "Kitchen Care"],
    "07": ["Multi-Surface Cleaner", "Home Care"],
    "08": ["Dishwash", "Kitchen Care"],
    "09": ["Tap/Limescale Cleaner", "Home Care"],
    "10": ["Laundry Detergent", "Laundry Care"],
    "11": ["Air Freshener", "Air Care"],
    "12": ["Odour Eliminator", "Air Care"],
    "13": ["Washing-machine Descaler/Cleaner", "Laundry Care"],
    "14": ["Stain Remover", "Laundry Care"],
    "15": ["Car/Vehicle Cleaner", "Vehicle Care"]
  };

  const categories = [
    "All Products",
    "Personal Care",
    "Home Care",
    "Kitchen Care",
    "Laundry Care",
    "Air Care",
    "Vehicle Care"
  ];

  // DEMONSTRATION PRICES - NOT FINAL SELLING PRICES
  const prices = {
    "01":149,"02":179,"03":179,"04":179,"05":169,
    "06":179,"07":189,"08":169,"09":199,"10":229,
    "11":189,"12":199,"13":219,"14":179,"15":199
  };

  const cart = {};

  let verified = false;
  let sessionToken = "";
  let starterKitPurchases = {};
  let otpSent = false;
  let requestData = null;

  // REFILL ELIGIBILITY
  function hasHistoricalStarterKit(id) {
    const value = starterKitPurchases[id];

    return value === true ||
      value === 1 ||
      String(value).toLowerCase() === "true" ||
      String(value) === "1";
  }

  function hasStarterKitInCart(id) {
    const item = cart[id + "-starter"];
    return Boolean(item && item.qty > 0);
  }

  function canUseRefill(id) {
    return hasStarterKitInCart(id) ||
      (verified && hasHistoricalStarterKit(id));
  }

  function removeIneligibleRefills() {
    Object.keys(cart).forEach(key => {
      const item = cart[key];

      if (item.kit === "refill" && !canUseRefill(item.id)) {
        delete cart[key];
      }
    });
  }

  // GOOGLE APPS SCRIPT JSONP CONNECTION
  function jsonp(action, data) {
    return new Promise((resolve, reject) => {
      const callback = "aqCallback" + Date.now() +
        Math.floor(Math.random() * 10000);

      const script = document.createElement("script");

      const params = new URLSearchParams({
        action,
        ...data,
        callback
      });

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("Request timed out. Please try again."));
      }, 20000);

      function cleanup() {
        clearTimeout(timeout);
        delete window[callback];
        script.remove();
      }

      window[callback] = response => {
        cleanup();
        resolve(response);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("Could not connect. Please try again."));
      };

      script.src = SHEET_ENDPOINT + "?" + params.toString();
      document.head.appendChild(script);
    });
  }

  // WEBSITE STYLING
  const style = document.createElement("style");

  style.textContent = `
    #aq-category-area {
      width:100%;
      margin:20px 0;
    }

    #aq-category-heading {
      color:#153d35;
      font-size:22px;
      font-weight:700;
      margin-bottom:12px;
    }

    #aq-category-nav {
      display:flex;
      flex-wrap:wrap;
      gap:9px;
      margin:12px 0 20px;
    }

    .aq-category-btn {
      background:white;
      color:#153d35;
      border:1px solid #153d35;
      border-radius:22px;
      padding:9px 16px;
      cursor:pointer;
      font-size:14px;
      font-weight:600;
    }

    .aq-category-btn.active {
      background:#153d35;
      color:white;
    }

    .aq-product-category {
      display:inline-block;
      background:#e8f1ed;
      color:#153d35;
      padding:5px 10px;
      border-radius:15px;
      font-size:12px;
      margin:5px 0;
    }

    .aq-product-actions {
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:10px;
    }

    .aq-product-btn {
      flex:1;
      min-width:115px;
      padding:10px 12px;
      border-radius:8px;
      border:1px solid #153d35;
      cursor:pointer;
      font-size:13px;
      font-weight:650;
    }

    .aq-starter-btn {
      background:#153d35;
      color:white;
    }

    .aq-refill-btn {
      background:white;
      color:#153d35;
    }

    .aq-refill-btn:disabled {
      opacity:0.45;
      cursor:not-allowed;
      background:#eee;
      color:#666;
      border-color:#aaa;
    }

    #aq-cart-btn {
      background:#153d35;
      color:white;
      border:0;
      padding:10px 16px;
      border-radius:8px;
      cursor:pointer;
    }

    #aq-cart-panel {
      display:none;
      position:fixed;
      inset:0;
      background:#0009;
      z-index:99999;
      align-items:center;
      justify-content:center;
      padding:12px;
    }

    #aq-cart-box {
      background:white;
      color:#222;
      width:100%;
      max-width:560px;
      max-height:92vh;
      overflow:auto;
      border-radius:16px;
      padding:20px;
      font:14px/1.5 system-ui,Arial;
    }

    #aq-cart-box button {
      padding:8px 12px;
      margin:3px;
      cursor:pointer;
    }

    .aq-item {
      border-bottom:1px solid #ddd;
      padding:12px 0;
    }

    .aq-action {
      background:#153d35;
      color:white;
      border:0;
      border-radius:7px;
    }

    #aq-cart-box input {
      padding:10px;
      width:100%;
      margin:5px 0 10px;
      border:1px solid #ccd6dc;
      border-radius:7px;
      box-sizing:border-box;
    }

    #aq-cart-box label {
      font-weight:650;
      display:block;
      margin-top:5px;
    }

    .aq-note {
      font-size:12px;
      color:#6b7780;
    }

    .aq-section {
      border-top:1px solid #e5e9eb;
      margin-top:14px;
      padding-top:12px;
    }

    .aq-error {
      color:#a32626;
      font-size:13px;
    }

    .aq-success {
      color:#176b3b;
      font-size:13px;
    }

    @media(max-width:600px) {
      #aq-category-heading {
        font-size:19px;
      }

      .aq-category-btn {
        padding:8px 12px;
        font-size:13px;
      }

      .aq-product-btn {
        min-width:105px;
        font-size:12px;
      }
    }
  `;

  document.head.appendChild(style);

  // FIND WEBSITE SECTIONS
  const nav = document.querySelector(".nav") ||
    document.querySelector("header");

  const productsContainer = document.querySelector(".products");

  if (!nav) {
    return console.warn("AQUENIX navigation not found");
  }

  if (!productsContainer) {
    return console.warn("AQUENIX products section not found");
  }

  // FIND EXISTING PRODUCT LIST ITEMS
  const productItems = [
    ...document.querySelectorAll(".products li")
  ];

  // CATEGORY NAVIGATION
  const categoryArea = document.createElement("div");
  categoryArea.id = "aq-category-area";

  const categoryHeading = document.createElement("div");
  categoryHeading.id = "aq-category-heading";
  categoryHeading.textContent = "Shop by Category";

  const categoryNav = document.createElement("div");
  categoryNav.id = "aq-category-nav";

  categoryArea.append(categoryHeading, categoryNav);

  productsContainer.parentNode.insertBefore(
    categoryArea,
    productsContainer
  );

  function filterProducts(selectedCategory) {
    productItems.forEach(li => {
      const match = li.innerText.match(/\b(0[1-9]|1[0-5])\b/);
      if (!match) return;

      const id = match[1];
      const category = products[id][1];

      li.hidden = selectedCategory !== "All Products" &&
        category !== selectedCategory;
    });

    categoryNav.querySelectorAll("button").forEach(button => {
      const active = button.dataset.category === selectedCategory;

      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  categories.forEach(category => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "aq-category-btn";
    button.textContent = category;
    button.dataset.category = category;

    button.onclick = () => filterProducts(category);

    categoryNav.appendChild(button);
  });

  filterProducts("All Products");

  // CART PANEL
  const panel = document.createElement("div");
  panel.id = "aq-cart-panel";

  panel.innerHTML = `
    <div id="aq-cart-box">
      <button id="aq-close" style="float:right">✕</button>
      <h2>Your AQUENIX Cart</h2>

      <p class="aq-note">
        <b>Demo only:</b> prices are illustrative, not actual selling prices.
      </p>

      <div id="aq-items"></div>
      <h3 id="aq-total">Demo total: ₹0</h3>
      <button id="aq-clear">Clear cart</button>

      <div class="aq-section">
        <h3>Customer Verification</h3>

        <p class="aq-note">
          Enter your mobile number and details. We will send an OTP
          to your email address. Existing customers receive the OTP
          at their registered email address.
        </p>

        <form id="aq-registration">
          <label>10-digit Indian mobile number *</label>
          <input id="aq-mobile" inputmode="numeric"
            pattern="[6-9][0-9]{9}" maxlength="10" required>

          <label>Full name (required for new customers)</label>
          <input id="aq-name" autocomplete="name">

          <label>Email address (required for new customers)</label>
          <input id="aq-email" type="email" autocomplete="email">

          <label>City (required for new customers)</label>
          <input id="aq-city" autocomplete="address-level2">

          <label style="font-weight:400">
            <input id="aq-whatsapp" type="checkbox" style="width:auto">
            I agree to receive optional AQUENIX WhatsApp updates.
          </label>

          <button class="aq-action" id="aq-register" type="submit">
            Send email OTP
          </button>
        </form>

        <div id="aq-otp-area" hidden>
          <label>Enter 6-digit OTP</label>
          <input id="aq-otp" inputmode="numeric"
            maxlength="6" pattern="[0-9]{6}"
            autocomplete="one-time-code">

          <button class="aq-action" id="aq-verify" type="button">
            Verify OTP
          </button>
        </div>

        <p id="aq-register-status" aria-live="polite"></p>
        <p id="aq-access-status" class="aq-success"></p>
      </div>

      <div class="aq-section">
        <h3>Checkout Preview</h3>

        <p id="aq-preview">
          Verify your email OTP to unlock the preview.
        </p>

        <button class="aq-action" id="aq-checkout" disabled>
          Continue to preview
        </button>

        <p class="aq-note">
          Live payments are disabled. No money will be collected.
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // ADD PRODUCT TO CART
  function addProduct(id, kit) {
    const key = id + "-" + kit;

    if (kit === "refill" && !canUseRefill(id)) {
      alert(
        "Refill is not yet available. First add this product's " +
        "Starter Kit or verify a confirmed past purchase of this exact Starter Kit."
      );
      return;
    }

    const existing = document.getElementById("aq-quantity-choice");
    if (existing) existing.remove();

    const chooser = document.createElement("div");
    chooser.id = "aq-quantity-choice";
    chooser.className = "aq-section";

    const product = products[id];

    chooser.innerHTML = `
      <h3>${product[0]}</h3>
      <p class="aq-note">${product[1]} · Product ${id}</p>
      <p><b>${kit === "starter" ? "Starter Kit" : "Refill Pack"}</b></p>
      <p class="aq-note">
        ${kit === "starter"
          ? "Reusable bottle/container with matching product tablets."
          : "Matching product tablets only."}
      </p>
      <label>Number of packs</label>
      <input id="aq-product-qty" type="number"
        min="1" max="99" value="1">
      <button class="aq-action" id="aq-confirm-add">
        Add to Cart
      </button>
      <button id="aq-cancel-add">Cancel</button>
    `;

    document.getElementById("aq-items").prepend(chooser);

    document.getElementById("aq-confirm-add").onclick = () => {
      const qty = Number(
        document.getElementById("aq-product-qty").value
      );

      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        alert("Enter a quantity from 1 to 99.");
        return;
      }

      if (kit === "refill" && !canUseRefill(id)) {
        alert("This product's Starter Kit is required for refill.");
        return;
      }

      if (!cart[key]) {
        cart[key] = { id, kit, qty: 0 };
      }

      cart[key].qty += qty;

      chooser.remove();
      update();
      refreshProductButtons();
    };

    document.getElementById("aq-cancel-add").onclick =
      () => chooser.remove();

    panel.style.display = "flex";
  }

  // ADD CATEGORY LABELS AND TWO PRODUCT BUTTONS
  function refreshProductButtons() {
    productItems.forEach(li => {
      const match = li.innerText.match(/\b(0[1-9]|1[0-5])\b/);
      if (!match) return;

      const id = match[1];
      const product = products[id];

      if (!product) return;

      if (!li.querySelector(".aq-product-category")) {
        const categoryLabel = document.createElement("span");
        categoryLabel.className = "aq-product-category";
        categoryLabel.textContent = product[1];
        li.appendChild(categoryLabel);
      }

      let actions = li.querySelector(".aq-product-actions");

      if (!actions) {
        actions = document.createElement("div");
        actions.className = "aq-product-actions";
        li.appendChild(actions);
      }

      actions.innerHTML = "";

      const starterButton = document.createElement("button");
      starterButton.type = "button";
      starterButton.className =
        "aq-product-btn aq-starter-btn";
      starterButton.textContent = "Starter Kit";

      starterButton.onclick = () => {
        addProduct(id, "starter");
      };

      const refillButton = document.createElement("button");
      refillButton.type = "button";
      refillButton.className =
        "aq-product-btn aq-refill-btn";
      refillButton.textContent = "Refill";

      const refillAllowed = canUseRefill(id);
      refillButton.disabled = !refillAllowed;

      refillButton.title = refillAllowed
        ? "Add this product's refill pack"
        : "Add this product's Starter Kit first or verify a previous purchase";

      refillButton.onclick = () => {
        addProduct(id, "refill");
      };

      actions.append(starterButton, refillButton);
    });
  }

  refreshProductButtons();

  // CART BUTTON
  const cartBtn = document.createElement("button");
  cartBtn.id = "aq-cart-btn";
  cartBtn.textContent = "Cart (0)";
  nav.appendChild(cartBtn);

  function countItems() {
    return Object.values(cart).reduce(
      (sum, item) => sum + item.qty, 0
    );
  }

  function update() {
    cartBtn.textContent = `Cart (${countItems()})`;

    const items = document.getElementById("aq-items");
    items.innerHTML = "";

    let total = 0;

    Object.entries(cart).forEach(([key, item]) => {
      const product = products[item.id];
      const price = prices[item.id];

      total += price * item.qty;

      const div = document.createElement("div");
      div.className = "aq-item";

      const title = document.createElement("b");
      title.textContent = product[0];

      const details = document.createElement("p");
      details.className = "aq-note";
      details.textContent = product[1] + " · Product " + item.id;

      const kit = document.createElement("p");
      kit.textContent = item.kit === "starter"
        ? "Starter Kit: 1 matching reusable bottle + product-specific tablets"
        : "Refill Pack: matching product-specific tablets only";

      const priceLine = document.createElement("p");
      priceLine.textContent = `Demo price ₹${price} × ${item.qty}`;

      const controls = document.createElement("div");

      ["minus", "plus", "remove"].forEach(action => {
        const button = document.createElement("button");

        button.textContent = action === "minus" ? "−" :
          action === "plus" ? "+" : "Remove";

        button.dataset.key = key;
        button.dataset.action = action;

        controls.appendChild(button);
      });

      div.append(title, details, kit, priceLine, controls);
      items.appendChild(div);
    });

    if (!countItems()) {
      items.textContent = "Your cart is empty.";
    }

    document.getElementById("aq-total").textContent =
      `Demo total: ₹${total}`;
  }

  // CART EVENTS
  cartBtn.onclick = () => {
    update();
    panel.style.display = "flex";
  };

  document.getElementById("aq-close").onclick = () => {
    panel.style.display = "none";
  };

  panel.onclick = event => {
    if (event.target === panel) {
      panel.style.display = "none";
    }
  };

  document.getElementById("aq-items").onclick = event => {
    const button = event.target.closest("button[data-key]");
    if (!button) return;

    const key = button.dataset.key;
    if (!cart[key]) return;

    if (button.dataset.action === "plus") cart[key].qty++;
    if (button.dataset.action === "minus") cart[key].qty--;

    if (button.dataset.action === "remove" ||
        cart[key].qty <= 0) {
      delete cart[key];
    }

    removeIneligibleRefills();
    update();
    refreshProductButtons();
  };

  document.getElementById("aq-clear").onclick = () => {
    Object.keys(cart).forEach(key => delete cart[key]);
    update();
    refreshProductButtons();
  };

  // CUSTOMER REGISTRATION AND EMAIL OTP
  const form = document.getElementById("aq-registration");
  const status = document.getElementById("aq-register-status");
  const registerButton = document.getElementById("aq-register");
  const verifyButton = document.getElementById("aq-verify");
  const checkoutButton = document.getElementById("aq-checkout");

  function getCustomerData() {
    return {
      mobile: document.getElementById("aq-mobile").value.trim(),
      fullName: document.getElementById("aq-name").value.trim(),
      email: document.getElementById("aq-email").value.trim(),
      customerType: "Household",
      city: document.getElementById("aq-city").value.trim(),

      interestedCategories: [...new Set(
        Object.values(cart).map(item => products[item.id][1])
      )].join(", "),

      whatsappConsent: String(
        document.getElementById("aq-whatsapp").checked
      )
    };
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!countItems()) {
      status.className = "aq-error";
      status.textContent = "Add a product pack to your cart first.";
      return;
    }

    const data = getCustomerData();

    if (!/^[6-9][0-9]{9}$/.test(data.mobile)) {
      status.className = "aq-error";
      status.textContent =
        "Enter a valid 10-digit Indian mobile number.";
      return;
    }

    if (data.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      status.className = "aq-error";
      status.textContent = "Enter a valid email address.";
      return;
    }

    requestData = data;

    registerButton.disabled = true;
    registerButton.textContent = "Sending OTP...";

    status.className = "aq-note";
    status.textContent = "Requesting email verification code...";

    try {
      const result = await jsonp("sendOtp", data);

      if (!result || !result.success) {
        throw new Error(result?.message || "Could not send OTP.");
      }

      otpSent = true;

      document.getElementById("aq-otp-area").hidden = false;

      status.className = "aq-success";

      status.textContent = result.maskedEmail
        ? "OTP sent to registered email: " + result.maskedEmail
        : "OTP sent. Please check your email inbox and spam folder.";

      document.getElementById("aq-otp").focus();

    } catch (error) {
      status.className = "aq-error";
      status.textContent = error.message;

    } finally {
      registerButton.disabled = false;
      registerButton.textContent = "Send email OTP";
    }
  });

  verifyButton.onclick = async () => {
    const otp = document.getElementById("aq-otp").value.trim();

    if (!otpSent || !requestData) {
      status.className = "aq-error";
      status.textContent = "Please request an OTP first.";
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      status.className = "aq-error";
      status.textContent = "Enter the 6-digit OTP from your email.";
      return;
    }

    verifyButton.disabled = true;
    verifyButton.textContent = "Verifying...";

    status.className = "aq-note";
    status.textContent = "Verifying your email...";

    try {
      const result = await jsonp("verifyOtp", {
        ...requestData,
        otp
      });

      if (!result || !result.success || result.verified !== true) {
        throw new Error(
          result?.message || "OTP verification failed."
        );
      }

      if (!result.sessionToken) {
        throw new Error(
          "Verification session missing. Please verify OTP again."
        );
      }

      if (!result.starterKitPurchases ||
          typeof result.starterKitPurchases !== "object") {
        throw new Error(
          "Product purchase history could not be read. " +
          "Please contact AQUENIX support."
        );
      }

      // SAVE SESSION TOKEN AFTER SUCCESSFUL OTP
      sessionToken = result.sessionToken;
      verified = true;
      starterKitPurchases = result.starterKitPurchases;

      removeIneligibleRefills();
      refreshProductButtons();

      checkoutButton.disabled = false;
      form.hidden = true;

      document.getElementById("aq-otp-area").hidden = true;

      status.className = "aq-success";
      status.textContent =
        result.message || "Email verified successfully.";

      document.getElementById("aq-access-status").textContent =
        "Verified customer. Refill eligibility is checked separately " +
        "for each product using your confirmed Starter Kit purchase history.";

      document.getElementById("aq-preview").textContent =
        "Email verified. You can continue to the demonstration " +
        "checkout. No order or payment will be made.";

      update();

    } catch (error) {
      status.className = "aq-error";
      status.textContent = error.message;

    } finally {
      verifyButton.disabled = false;
      verifyButton.textContent = "Verify OTP";
    }
  };

  // SAVE CART TO GOOGLE SHEET - DEMO CHECKOUT ONLY
  checkoutButton.onclick = async () => {
    if (!verified || !sessionToken) {
      document.getElementById("aq-preview").textContent =
        "Please verify your email OTP first.";
      return;
    }

    if (!countItems()) {
      document.getElementById("aq-preview").textContent =
        "Your cart is empty.";
      return;
    }

    const items = Object.values(cart).map(item => ({
      id: item.id,
      kit: item.kit,
      qty: item.qty
    }));

    checkoutButton.disabled = true;
    checkoutButton.textContent = "Saving checkout...";

    try {
      const result = await jsonp("saveCheckout", {
        sessionToken: sessionToken,
        items: JSON.stringify(items)
      });

      if (!result || !result.success) {
        throw new Error(
          result?.message || "Could not save checkout."
        );
      }

      document.getElementById("aq-preview").textContent =
        "Demo checkout successfully recorded in AQUENIX. " +
        "Reference: " + result.checkoutRef +
        ". No order or payment has been made.";

      checkoutButton.textContent = "Checkout Recorded";

    } catch (error) {
      document.getElementById("aq-preview").textContent =
        "Checkout not recorded: " + error.message;

      checkoutButton.disabled = false;
      checkoutButton.textContent = "Continue to preview";
    }
  };

  update();

})();
