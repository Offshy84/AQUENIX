
(() => {
  // AQUENIX cart + email OTP verification
  // Demo checkout only. Live payments are disabled.

  const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbyTr1d5oHLsrjDNqnPd7C5WYkkS5p1m0H13VJfgjTW1_mc4SgS9CUFEEcHiTRZZ-MNp/exec";

  const products = {
    "01": ["Foaming Handwash", "Personal Care"],
    "02": ["Floor Cleaner", "Home & Surface Care"],
    "03": ["Toilet Cleaner", "Toilet & Speciality Care"],
    "04": ["Bathroom Cleaner", "Home & Surface Care"],
    "05": ["Glass & Mirror Cleaner", "Home & Surface Care"],
    "06": ["Kitchen Cleaner", "Home & Surface Care"],
    "07": ["Multi-Surface Cleaner", "Home & Surface Care"],
    "08": ["Dishwash", "Dish Care"],
    "09": ["Tap/Limescale Cleaner", "Toilet & Speciality Care"],
    "10": ["Laundry Detergent", "Laundry & Fabric Care"],
    "11": ["Air Freshener", "Air & Odour Care"],
    "12": ["Odour Eliminator", "Air & Odour Care"],
    "13": ["Washing-machine Descaler/Cleaner", "Appliance Care"],
    "14": ["Stain Remover", "Laundry & Fabric Care"],
    "15": ["Car/Vehicle Cleaner", "Vehicle Care"]
  };

  const prices = {
    "01":149,"02":179,"03":179,"04":179,"05":169,
    "06":179,"07":189,"08":169,"09":199,"10":229,
    "11":189,"12":199,"13":219,"14":179,"15":199
  };

  const cart = {};
  let verified = false;
  let starterKitPurchases = {};
  let otpSent = false;
  let requestData = null;

  // Check whether the customer previously purchased this exact Starter Kit.
  function hasHistoricalStarterKit(id) {
    const value = starterKitPurchases[id];
    return value === true || value === 1 ||
      String(value).toLowerCase() === "true" || String(value) === "1";
  }

  // Check whether this product's Starter Kit is in the current cart.
  function hasStarterKitInCart(id) {
    const item = cart[id + "-starter"];
    return Boolean(item && item.qty > 0);
  }

  // Refill eligibility is product-specific.
  function canUseRefill(id) {
    return hasStarterKitInCart(id) ||
      (verified && hasHistoricalStarterKit(id));
  }

  // Remove refill packs if their matching Starter Kit is no longer eligible.
  function removeIneligibleRefills() {
    Object.keys(cart).forEach(key => {
      const item = cart[key];
      if (item.kit === "refill" && !canUseRefill(item.id)) {
        delete cart[key];
      }
    });
  }

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

  const style = document.createElement("style");
  style.textContent = `
    #aq-cart-btn{background:#153d35;color:white;border:0;padding:10px 16px;border-radius:8px;cursor:pointer}
    #aq-cart-panel{display:none;position:fixed;inset:0;background:#0009;z-index:99999;align-items:center;justify-content:center;padding:12px}
    #aq-cart-box{background:white;color:#222;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:16px;padding:20px;font:14px/1.5 system-ui,Arial}
    #aq-cart-box button{padding:8px 12px;margin:3px;cursor:pointer}
    .aq-item{border-bottom:1px solid #ddd;padding:12px 0}
    .aq-action{background:#153d35;color:white;border:0;border-radius:7px}
    .aq-add{margin-top:7px}
    #aq-cart-box input{padding:10px;width:100%;margin:5px 0 10px;border:1px solid #ccd6dc;border-radius:7px;box-sizing:border-box}
    #aq-cart-box label{font-weight:650;display:block;margin-top:5px}
    .aq-choice{border:1px solid #d6e4df;border-radius:10px;padding:12px;margin:9px 0;display:block;cursor:pointer}
    .aq-note{font-size:12px;color:#6b7780}
    .aq-section{border-top:1px solid #e5e9eb;margin-top:14px;padding-top:12px}
    .aq-error{color:#a32626;font-size:13px}
    .aq-success{color:#176b3b;font-size:13px}
  `;
  document.head.appendChild(style);

  const nav = document.querySelector(".nav") || document.querySelector("header");
  if (!nav) return console.warn("AQUENIX navigation not found");

  const cartBtn = document.createElement("button");
  cartBtn.id = "aq-cart-btn";
  cartBtn.textContent = "Cart (0)";
  nav.appendChild(cartBtn);

  const panel = document.createElement("div");
  panel.id = "aq-cart-panel";
  panel.innerHTML = `
    <div id="aq-cart-box">
      <button id="aq-close" style="float:right">✕</button>
      <h2>Your AQUENIX Cart</h2>
      <p class="aq-note"><b>Demo only:</b> prices are illustrative, not actual selling prices.</p>

      <div id="aq-items"></div>
      <h3 id="aq-total">Demo total: ₹0</h3>
      <button id="aq-clear">Clear cart</button>

      <div class="aq-section">
        <h3>Customer Verification</h3>
        <p class="aq-note">Enter your mobile number and details. We will send an OTP to your email address. Existing customers receive the OTP at their registered email address.</p>

        <form id="aq-registration">
          <label>10-digit Indian mobile number *</label>
          <input id="aq-mobile" inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" required>

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

          <button class="aq-action" id="aq-register" type="submit">Send email OTP</button>
        </form>

        <div id="aq-otp-area" hidden>
          <label>Enter 6-digit OTP</label>
          <input id="aq-otp" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" autocomplete="one-time-code">
          <button class="aq-action" id="aq-verify" type="button">Verify OTP</button>
        </div>

        <p id="aq-register-status" aria-live="polite"></p>
        <p id="aq-access-status" class="aq-success"></p>
      </div>

      <div class="aq-section">
        <h3>Checkout Preview</h3>
        <p id="aq-preview">Verify your email OTP to unlock the preview.</p>
        <button class="aq-action" id="aq-checkout" disabled>Continue to preview</button>
        <p class="aq-note">Live payments are disabled. No money will be collected.</p>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  function countItems() {
    return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
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
        button.textContent = action === "minus" ? "−" : action === "plus" ? "+" : "Remove";
        button.dataset.key = key;
        button.dataset.action = action;
        controls.appendChild(button);
      });

      div.append(title, details, kit, priceLine, controls);
      items.appendChild(div);
    });

    if (!countItems()) items.textContent = "Your cart is empty.";

    document.getElementById("aq-total").textContent =
      `Demo total: ₹${total}`;
  }

  function chooseProduct(id) {
    const existing = document.getElementById("aq-product-choice");
    if (existing) existing.remove();

    const product = products[id];
    const chooser = document.createElement("div");
    chooser.id = "aq-product-choice";
    chooser.className = "aq-section";

    chooser.innerHTML = `
      <h3>${product[0]}</h3>
      <p class="aq-note">${product[1]} · Product ${id}</p>
      <p><b>Choose your pack:</b></p>

      <label class="aq-choice">
        <input type="radio" name="aq-kit" value="starter" checked style="width:auto">
        <b>Starter Kit (Recommended)</b>
        <p class="aq-note">One reusable mixing bottle/container with matching product tablets.</p>
      </label>

      <label class="aq-choice" id="aq-refill-choice">
        <input type="radio" name="aq-kit" value="refill" style="width:auto">
        <b>Refill Pack</b>
        <p class="aq-note">Matching product tablets only, for customers who already have a compatible bottle.</p>
      </label>

      <label>Number of packs</label>
      <input id="aq-product-qty" type="number" min="1" max="99" value="1">

      <button class="aq-action" id="aq-add-selected">Add to Cart</button>
      <button id="aq-cancel-selected">Cancel</button>

      <p class="aq-note">Exact tablet quantity, water measurement and bottle specifications will be confirmed after product testing.</p>
    `;

    document.getElementById("aq-items").prepend(chooser);

    const refillChoice = chooser.querySelector("#aq-refill-choice");
    const refillRadio = refillChoice.querySelector('input[name="aq-kit"]');
    const refillAllowed = canUseRefill(id);

    refillRadio.disabled = !refillAllowed;

    if (!refillAllowed) {
      refillChoice.style.opacity = "0.65";
      refillChoice.querySelector(".aq-note").textContent =
        "First add this product's Starter Kit, or verify an account with a confirmed past purchase of this exact Starter Kit.";
    } else {
      refillChoice.querySelector(".aq-note").textContent =
        "Matching product tablets only. Available because this product's Starter Kit is in your cart or in your verified purchase history.";
    }

    document.getElementById("aq-add-selected").onclick = () => {
      const selected = chooser.querySelector('input[name="aq-kit"]:checked');

      if (!selected) {
        alert("Please choose a pack.");
        return;
      }

      const kit = selected.value;
      const qty = Number(document.getElementById("aq-product-qty").value);

      if (kit === "refill" && !canUseRefill(id)) {
        alert("Please add this product's Starter Kit first. A Starter Kit for a different product does not qualify.");
        return;
      }

      if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
        alert("Enter a quantity from 1 to 99.");
        return;
      }

      const key = id + "-" + kit;
      if (!cart[key]) cart[key] = { id, kit, qty: 0 };
      cart[key].qty += qty;

      chooser.remove();
      update();
    };

    document.getElementById("aq-cancel-selected").onclick = () => chooser.remove();
  }

  document.querySelectorAll(".products li").forEach(li => {
    const match = li.innerText.match(/\b(0[1-9]|1[0-5])\b/);
    if (!match) return;

    const id = match[1];
    if (li.querySelector(".aq-add")) return;

    const button = document.createElement("button");
    button.className = "aq-add aq-action";
    button.type = "button";
    button.textContent = "Choose Starter Kit / Refill";

    button.onclick = () => {
      panel.style.display = "flex";
      chooseProduct(id);
    };

    li.appendChild(button);
  });

  cartBtn.onclick = () => {
    update();
    panel.style.display = "flex";
  };

  document.getElementById("aq-close").onclick = () => {
    panel.style.display = "none";
  };

  panel.onclick = event => {
    if (event.target === panel) panel.style.display = "none";
  };

  document.getElementById("aq-items").onclick = event => {
    const button = event.target.closest("button[data-key]");
    if (!button) return;

    const key = button.dataset.key;
    if (!cart[key]) return;

    if (button.dataset.action === "plus") cart[key].qty++;
    if (button.dataset.action === "minus") cart[key].qty--;

    if (button.dataset.action === "remove" || cart[key].qty <= 0) {
      delete cart[key];
    }

    removeIneligibleRefills();
    update();
  };

  document.getElementById("aq-clear").onclick = () => {
    Object.keys(cart).forEach(key => delete cart[key]);
    update();
  };

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
      whatsappConsent: String(document.getElementById("aq-whatsapp").checked)
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
      status.textContent = "Enter a valid 10-digit Indian mobile number.";
      return;
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
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
        throw new Error(result?.message || "OTP verification failed.");
      }

      if (!result.starterKitPurchases ||
          typeof result.starterKitPurchases !== "object") {
        throw new Error("Product purchase history could not be read. Please contact AQUENIX support.");
      }

      verified = true;
      starterKitPurchases = result.starterKitPurchases;
      removeIneligibleRefills();

      checkoutButton.disabled = false;
      form.hidden = true;
      document.getElementById("aq-otp-area").hidden = true;

      status.className = "aq-success";
      status.textContent = result.message || "Email verified successfully.";

      document.getElementById("aq-access-status").textContent =
        "Verified customer. Refill eligibility is checked separately for each product using your confirmed Starter Kit purchase history.";

      document.getElementById("aq-preview").textContent =
        "Email verified. You can continue to the demonstration checkout. No order or payment will be made.";

      update();

    } catch (error) {
      status.className = "aq-error";
      status.textContent = error.message;
    } finally {
      verifyButton.disabled = false;
      verifyButton.textContent = "Verify OTP";
    }
  };

  checkoutButton.onclick = () => {
    if (!verified) return;

    document.getElementById("aq-preview").textContent =
      "Customer verification successful. This is a checkout demonstration only. No order is submitted and live payments are disabled.";
  };

  update();
})();
