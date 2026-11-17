
(() => {
  const prices = {
    "01":149,"02":179,"03":179,"04":179,"05":169,
    "06":179,"07":189,"08":169,"09":199,"10":229,
    "11":189,"12":199,"13":219,"14":179,"15":199
  };

  const cart = {};
  const style = document.createElement("style");
  style.textContent = `
    #aq-cart-btn{background:#153d35;color:white;border:0;padding:10px 16px;border-radius:8px;cursor:pointer}
    #aq-cart-panel{display:none;position:fixed;inset:0;background:#0009;z-index:99999;align-items:center;justify-content:center;padding:15px}
    #aq-cart-box{background:white;color:#222;width:100%;max-width:520px;max-height:85vh;overflow:auto;border-radius:16px;padding:20px}
    #aq-cart-box button{padding:7px 12px;margin:3px;cursor:pointer}
    .aq-item{border-bottom:1px solid #ddd;padding:12px 0}
    .aq-action{background:#153d35;color:white;border:0;border-radius:7px}
    #aq-cart-box input,#aq-cart-box select{padding:10px;width:100%;margin:7px 0}
  `;
  document.head.appendChild(style);

  const nav = document.querySelector(".nav") || document.querySelector("header");
  if (!nav) return console.warn("AQUENIX cart: navigation not found");

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
      <p><b>Demo cart only</b> — prices are illustrative, not actual selling prices.</p>
      <div id="aq-items"></div>
      <h3 id="aq-total">Demo total: ₹0</h3>
      <button id="aq-clear">Clear cart</button>
      <hr>
      <h3>Checkout preview</h3>
      <label>Customer type</label>
      <select id="aq-type"><option>Household</option><option>B2B / Business</option></select>
      <p id="aq-preview">This is a preview only. No order or payment will be made.</p>
      <button class="aq-action" id="aq-checkout">Preview checkout</button>
    </div>`;
  document.body.appendChild(panel);

  function update() {
    const count = Object.values(cart).reduce((a,b)=>a+b,0);
    cartBtn.textContent = `Cart (${count})`;
    let total = 0;
    const items = document.getElementById("aq-items");
    items.innerHTML = "";
    Object.entries(cart).forEach(([id,qty]) => {
      const price = prices[id] || 0;
      total += price * qty;
      const div = document.createElement("div");
      div.className = "aq-item";
      div.innerHTML = `<b>Product ${id}</b> — Demo price ₹${price} × ${qty}
        <div>
        <button data-id="${id}" data-action="minus">−</button>
        <button data-id="${id}" data-action="plus">+</button>
        <button data-id="${id}" data-action="remove">Remove</button>
        </div>`;
      items.appendChild(div);
    });
    if (!count) items.textContent = "Your cart is empty.";
    document.getElementById("aq-total").textContent = `Demo total: ₹${total}`;
  }

  document.querySelectorAll(".products li").forEach(li => {
    const match = li.innerText.match(/\b(0[1-9]|1[0-5])\b/);
    if (!match) return;
    const id = match[1];
    if (li.querySelector(".aq-add")) return;
    const btn = document.createElement("button");
    btn.className = "aq-add aq-action";
    btn.textContent = "Add to Cart";
    btn.onclick = () => {
      cart[id] = (cart[id] || 0) + 1;
      update();
      panel.style.display = "flex";
    };
    li.appendChild(btn);
  });

  cartBtn.onclick = () => { update(); panel.style.display = "flex"; };
  document.getElementById("aq-close").onclick = () => panel.style.display = "none";
  panel.onclick = e => { if(e.target === panel) panel.style.display = "none"; };

  document.getElementById("aq-items").onclick = e => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "plus") cart[id]++;
    if (action === "minus") cart[id]--;
    if (action === "remove" || cart[id] <= 0) delete cart[id];
    update();
  };

  document.getElementById("aq-clear").onclick = () => {
    Object.keys(cart).forEach(id => delete cart[id]);
    update();
  };

  document.getElementById("aq-checkout").onclick = () => {
    const type = document.getElementById("aq-type").value;
    document.getElementById("aq-preview").textContent =
      `${type} checkout preview. This is a demonstration only. No order is submitted and no payment is collected.`;
  };

  update();
})();
