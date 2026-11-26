
/* AQUENIX CATEGORY-FIRST STOREFRONT
   Five launch products.
   Starter Kit / Refill appear only on product details.
   Existing cart, email OTP and demo checkout are retained.
*/

(() => {
  "use strict";

  const products = {
    "01": {
      name: "Foaming Handwash",
      category: "Personal Care",
      image: "assets/personal-care.jpg",
      colour: "#168477",
      shape: "pump"
    },
    "02": {
      name: "Floor Cleaner",
      category: "Home Care",
      image: "assets/home-surface-care.jpg",
      colour: "#168477",
      shape: "bottle"
    },
    "04": {
      name: "Bathroom Cleaner",
      category: "Home Care",
      image: "assets/toilet-specialty-care.jpg",
      colour: "#1684a0",
      shape: "trigger"
    },
    "05": {
      name: "Glass & Mirror Cleaner",
      category: "Home Care",
      image: "assets/appliance-care.jpg",
      colour: "#2996a6",
      shape: "trigger"
    },
    "07": {
      name: "Multipurpose Cleaner",
      category: "Home Care",
      image: "assets/home-surface-care.jpg",
      colour: "#168477",
      shape: "trigger"
    }
  };

  const categories = [
    {
      name: "Personal Care",
      image: "assets/personal-care.jpg",
      note: "1 launch product",
      active: true
    },
    {
      name: "Home Care",
      image: "assets/home-surface-care.jpg",
      note: "4 launch products",
      active: true
    },
    {
      name: "Kitchen Care",
      image: "assets/dish-care.jpg",
      note: "Coming soon",
      active: false
    },
    {
      name: "Laundry Care",
      image: "assets/laundry-fabric-care.jpg",
      note: "Coming soon",
      active: false
    },
    {
      name: "Air Care",
      image: "assets/air-odour-care.jpg",
      note: "Coming soon",
      active: false
    },
    {
      name: "Vehicle Care",
      image: "assets/vehicle-care.jpg",
      note: "Coming soon",
      active: false
    }
  ];

  const style = document.createElement("style");

  style.textContent = `
    #aq-category-area {
      display:none !important;
    }

    .aq-categories {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:18px;
      margin:25px 0;
    }

    .aq-category-card {
      padding:0;
      border:1px solid #e0e9e5;
      border-radius:18px;
      overflow:hidden;
      background:white;
      text-align:left;
      cursor:pointer;
      box-shadow:0 8px 24px #102c3810;
      transition:.2s;
    }

    .aq-category-card:hover {
      transform:translateY(-4px);
      box-shadow:0 14px 30px #102c3818;
    }

    .aq-category-card img {
      width:100%;
      height:175px;
      object-fit:cover;
      display:block;
    }

    .aq-category-card strong {
      display:block;
      padding:13px 14px 3px;
      color:#173c36;
      font-size:16px;
    }

    .aq-category-card small {
      display:block;
      padding:3px 14px 15px;
      color:#687a74;
    }

    .aq-category-card:disabled {
      opacity:.65;
      cursor:default;
    }

    .aq-back {
      padding:10px 17px;
      border:1px solid #173c36;
      border-radius:25px;
      background:white;
      color:#173c36;
      font-weight:700;
      cursor:pointer;
      margin:10px 0 20px;
    }

    .aq-store-title {
      color:#173c36;
      font-size:28px;
      margin:8px 0;
    }

    .aq-store-search {
      width:100%;
      max-width:420px;
      padding:12px 15px;
      border:1px solid #cbd9d5;
      border-radius:25px;
      margin:12px 0 20px;
      font:inherit;
    }

    .aq-detail {
      background:white;
      border:1px solid #e0e9e5;
      border-radius:20px;
      padding:22px;
      margin:20px 0;
      box-shadow:0 8px 24px #102c3810;
    }

    .aq-detail-grid {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:28px;
      align-items:center;
    }

    .aq-detail-image {
      width:100%;
      max-height:390px;
      object-fit:contain;
      border-radius:15px;
      background:#f4f8f6;
    }

    .aq-detail h3 {
      color:#173c36;
      font-size:27px;
      margin:8px 0;
    }

    .aq-detail-category {
      display:inline-block;
      background:#e8f1ed;
      color:#153d35;
      padding:6px 12px;
      border-radius:20px;
      font-size:12px;
    }

    .aq-detail-note {
      color:#687a74;
      font-size:14px;
      margin:14px 0;
    }

    .aq-detail-actions {
      display:flex;
      flex-wrap:wrap;
      gap:10px;
      margin-top:20px;
    }

    .aq-detail-actions button {
      flex:1;
      min-width:130px;
      padding:13px;
      border-radius:9px;
      border:1px solid #153d35;
      cursor:pointer;
      font-weight:750;
    }

    .aq-detail-starter {
      background:#153d35;
      color:white;
    }

    .aq-detail-refill {
      background:white;
      color:#153d35;
    }

    .aq-detail-refill:disabled {
      opacity:.45;
      cursor:not-allowed;
      background:#eee;
      color:#666;
      border-color:#aaa;
    }

    .aq-product-category {
      display:inline-block;
      background:#e8f1ed;
      color:#153d35;
      padding:5px 10px;
      border-radius:15px;
      font-size:11px;
      margin:5px 0;
    }

    /* Buttons are not shown on product listing cards. */
    .products .aq-product-actions {
      display:none !important;
    }

    .products li[hidden] {
      display:none !important;
    }

    .products li.aq-clickable-product {
      cursor:pointer;
    }

    .products li.aq-clickable-product:focus-visible {
      outline:3px solid #168477;
      outline-offset:3px;
    }

    @media(max-width:760px) {
      .aq-categories {
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:11px;
      }

      .aq-category-card img {
        height:125px;
      }

      .aq-category-card strong {
        font-size:14px;
      }

      .aq-store-title {
        font-size:23px;
      }

      .aq-detail {
        padding:14px;
      }

      .aq-detail-grid {
        grid-template-columns:1fr;
        gap:15px;
      }

      .aq-detail-image {
        max-height:250px;
      }

      .aq-detail h3 {
        font-size:22px;
      }
    }

    @media(max-width:370px) {
      .aq-categories {
        grid-template-columns:1fr;
      }
    }
  `;

  document.head.appendChild(style);

  function start() {
    const section = document.querySelector("#products .wrap");
    const list = document.querySelector(".products");
    const oldNav = document.getElementById("aq-category-area");

    if (!section || !list || !oldNav) {
      console.error("AQUENIX storefront: required website elements missing.");
      return;
    }

    oldNav.style.display = "none";

    const cards = [...list.querySelectorAll("li")];

    // Keep only the five agreed launch products.
    cards.forEach(card => {
      const number = card.querySelector(".product-number");
      const match = number?.textContent.match(/\d{2}/);
      const id = match?.[0];
      const item = products[id];

      if (!item) {
        card.hidden = true;
        return;
      }

      card.dataset.productId = id;
      card.dataset.category = item.category;
      card.dataset.productName = item.name.toLowerCase();

      const title = card.querySelector(".product-name");
      if (title) title.textContent = item.name;

      const image = card.querySelector(".product-image");
      if (image) {
        image.src = item.image;
        image.alt = "AQUENIX " + item.name + " product concept";
      }

      card.classList.add("aq-clickable-product");
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "View " + item.name);

      const categoryLabel = document.createElement("span");
      categoryLabel.className = "aq-product-category";
      categoryLabel.textContent = item.category;

      const status = card.querySelector(".product-status");
      if (status) {
        status.textContent = "In development";
        card.insertBefore(categoryLabel, status);
      }

      card.hidden = true;
    });

    // Homepage category cards.
    const categoryGrid = document.createElement("div");
    categoryGrid.className = "aq-categories";

    categories.forEach(item => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "aq-category-card";
      button.disabled = !item.active;

      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.name;

      const title = document.createElement("strong");
      title.textContent = item.name;

      const note = document.createElement("small");
      note.textContent = item.note;

      button.append(image, title, note);

      if (item.active) {
        button.addEventListener("click", () => {
          showCategory(item.name);
        });
      }

      categoryGrid.appendChild(button);
    });

    section.insertBefore(categoryGrid, oldNav);

    // Category product listing screen.
    const listingView = document.createElement("div");
    listingView.hidden = true;

    const back = document.createElement("button");
    back.type = "button";
    back.className = "aq-back";
    back.textContent = "← Back to All Categories";

    const heading = document.createElement("h3");
    heading.className = "aq-store-title";

    const search = document.createElement("input");
    search.className = "aq-store-search";
    search.type = "search";
    search.placeholder = "Search products";

    listingView.append(back, heading, search);
    section.insertBefore(listingView, list);

    // Individual product details screen.
    const detailView = document.createElement("div");
    detailView.className = "aq-detail";
    detailView.hidden = true;
    section.insertBefore(detailView, list);

    function showAllCategories() {
      categoryGrid.hidden = false;
      listingView.hidden = true;
      detailView.hidden = true;
      list.hidden = true;

      cards.forEach(card => card.hidden = true);

      section.scrollIntoView({ behavior: "smooth" });
    }

    function showCategory(name) {
      categoryGrid.hidden = true;
      listingView.hidden = false;
      detailView.hidden = true;
      list.hidden = false;

      heading.textContent = name;
      search.value = "";

      cards.forEach(card => {
        card.hidden = card.dataset.category !== name;
      });

      list.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    function showProduct(id) {
      const item = products[id];
      if (!item) return;

      categoryGrid.hidden = true;
      listingView.hidden = true;
      list.hidden = true;
      detailView.hidden = false;

      detailView.replaceChildren();

      const grid = document.createElement("div");
      grid.className = "aq-detail-grid";

      const image = document.createElement("img");
      image.className = "aq-detail-image";
      image.src = item.image;
      image.alt = "AQUENIX " + item.name;

      const info = document.createElement("div");

      const backButton = document.createElement("button");
      backButton.className = "aq-back";
      backButton.textContent = "← Back to " + item.category;
      backButton.onclick = () => showCategory(item.category);

      const category = document.createElement("span");
      category.className = "aq-detail-category";
      category.textContent = item.category;

      const title = document.createElement("h3");
      title.textContent = item.name;

      const note = document.createElement("p");
      note.className = "aq-detail-note";
      note.textContent =
        "AQUENIX product concept. Formulation, pack size, price and final specifications are still under development.";

      const actions = document.createElement("div");
      actions.className = "aq-detail-actions";

      const starter = document.createElement("button");
      starter.className = "aq-detail-starter";
      starter.textContent = "Starter Kit";
      starter.onclick = () => {
        if (typeof window.aqAddProduct === "function") {
          window.aqAddProduct(id, "starter");
        } else {
          alert("Cart is still loading. Please refresh the page.");
        }
      };

      const refill = document.createElement("button");
      refill.className = "aq-detail-refill";
      refill.textContent = "Refill";
      refill.disabled = !(
        typeof window.aqCanUseRefill === "function" &&
        window.aqCanUseRefill(id)
      );

      refill.title = refill.disabled
        ? "Purchase this product's Starter Kit first, or verify a previous Starter Kit purchase."
        : "Add this product's refill pack.";

      refill.onclick = () => {
        if (typeof window.aqAddProduct === "function") {
          window.aqAddProduct(id, "refill");
        }
      };

      actions.append(starter, refill);
      info.append(backButton, category, title, note, actions);
      grid.append(image, info);
      detailView.appendChild(grid);

      detailView.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    // Expose a refresh callback for the cart/OTP script.
    window.aqRefreshDetailRefill = () => {
      const button = detailView.querySelector(".aq-detail-refill");
      const id = cards.find(card =>
        card.dataset.productId &&
        !detailView.hidden &&
        detailView.querySelector("h3")?.textContent ===
          products[card.dataset.productId].name
      )?.dataset.productId;

      if (!button || !id) return;

      const allowed =
        typeof window.aqCanUseRefill === "function" &&
        window.aqCanUseRefill(id);

      button.disabled = !allowed;
      button.title = allowed
        ? "Add this product's refill pack."
        : "Purchase this product's Starter Kit first, or verify a previous Starter Kit purchase.";
    };

    cards.forEach(card => {
      const open = () => showProduct(card.dataset.productId);

      card.addEventListener("click", event => {
        if (event.target.closest("button")) return;
        open();
      });

      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });

    back.addEventListener("click", showAllCategories);

    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();

      cards.forEach(card => {
        if (card.dataset.category === heading.textContent) {
          card.hidden = !card.dataset.productName.includes(query);
        }
      });
    });

    showAllCategories();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
