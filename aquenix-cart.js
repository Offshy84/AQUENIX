
(() => {
  // AQUENIX demo cart — live payments disabled.
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

  const style = document.createElement("style");
  style.textContent = `
    #aq-cart-btn{background:#153d35;color:white;border:0;padding:10px 16px;border-radius:8px;cursor:pointer}
    #aq-cart-panel{display:none;position:fixed;inset:0;background:#0009;z-index:99999;align-items:center;justify-content:center;padding:12px}
    #aq-cart-box{background:white;color:#222;width:100%;max-width:560px;max-height:92vh;overflow:auto;border-radius:16px;padding:20px;font:14px/1.5 system-ui,Arial}
    #aq-cart-box button{padding:8px 12px;margin:3px;cursor:pointer}
    .aq-item{border-bottom:1px solid #ddd;padding:12px 0}
    .aq-action{background:#153d35;color:white;border:0;border-radius:7px}
    .aq-add{margin-top:7px}
    #aq-cart-box input{padding:10px;width:100%;margin:5px 0 10px;border:1px solid #ccd6dc;border-radius:7px}
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
        <h3>Household Registration</h3>
        <p class="aq-note">Registration is required to continue to the checkout preview.</p>

        <form id="aq-registration">
          <label>Full name *</label>
          <input id="aq-name" required autocomplete="name">

          <label>10-digit mobile number *</label>
          <input id="aq-mobile" inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" required>

          <label>Email address *</label>
          <input id="aq-email" type="email" required autocomplete="email">

          <label>City *</label>
          <input id="aq-city" required autocomplete="address-level2">

          <label style="font-weight:400">
            <input id="aq-whatsapp" type="checkbox" style="width:auto">
            I agree to receive optional AQUENIX WhatsApp updates.
          </label>

          <button class="aq-action" id="aq-register" type="submit">Submit registration</button>
          <p id="aq-register-status" aria-live="polite"></p>
        </form>
      </div>

      <div class="aq-section">
        <h3>Checkout Preview</h3>
        <p id="aq-preview">Complete registration to unlock the preview.</p>
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

      <label class="aq-choice">
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

    document.getElementById("aq-add-selected").onclick = () => {
      const kit = chooser.querySelector('input[name="aq-kit"]:checked').value;
      const qty = Number(document.getElementById("aq-product-qty").value);

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

    update();
  };

  document.getElementById("aq-clear").onclick = () => {
    Object.keys(cart).forEach(key => delete cart[key]);
    update();
  };

  const form = document.getElementById("aq-registration");
  const status = document.getElementById("aq-register-status");
  const registerButton = document.getElementById("aq-register");
  const checkoutButton = document.getElementById("aq-checkout");

  let registrationSubmitted = false;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!countItems()) {
      status.className = "aq-error";
      status.textContent = "Add a product pack to your cart first.";
      return;
    }

    const mobile = document.getElementById("aq-mobile").value.trim();

    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      status.className = "aq-error";
      status.textContent = "Enter a valid 10-digit Indian mobile number.";
      return;
    }

    const payload = {
      fullName: document.getElementById("aq-name").value.trim(),
      mobile: mobile,
      email: document.getElementById("aq-email").value.trim(),
      customerType: "Household",
      city: document.getElementById("aq-city").value.trim(),
      interestedCategories: [...new Set(
        Object.values(cart).map(item => products[item.id][1])
      )].join(", "),
      whatsappConsent: document.getElementById("aq-whatsapp").checked
    };

    registerButton.disabled = true;
    registerButton.textContent = "Submitting...";
    status.className = "aq-note";
    status.textContent = "Sending registration...";

    try {
      await fetch(SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      registrationSubmitted = true;
      checkoutButton.disabled = false;

      status.className = "aq-success";
      status.textContent =
        "Submission sent. Please verify the new customer row in your Google Sheet.";

      document.getElementById("aq-preview").textContent =
        "Registration submission sent. You can continue to the demonstration checkout. No order or payment will be made.";

    } catch (error) {
      status.className = "aq-error";
      status.textContent =
        "Could not send registration. Check your internet connection and try again.";
    } finally {
      registerButton.disabled = false;
      registerButton.textContent = "Submit registration";
    }
  });

  checkoutButton.onclick = () => {
    if (!registrationSubmitted) return;

    document.getElementById("aq-preview").textContent =
      "Household checkout demonstration only. No order is submitted and live payments are disabled.";
  };

  update();
})();
 
