
/* AQUENIX STOREFRONT
   Six categories | Five launch products
   Product details | Starter Kit and Refill
   Compatible with existing AQUENIX cart
*/

(() => {
  "use strict";

  const products = {
    "01": {
      name: "Foaming Handwash",
      category: "Personal Care",
      image: "assets/personal-care.jpg"
    },
    "02": {
      name: "Floor Cleaner",
      category: "Home Care",
      image: "assets/home-surface-care.jpg"
    },
    "04": {
      name: "Bathroom Cleaner",
      category: "Home Care",
      image: "assets/toilet-specialty-care.jpg"
    },
    "05": {
      name: "Glass & Mirror Cleaner",
      category: "Home Care",
      image: "assets/appliance-care.jpg"
    },
    "07": {
      name: "Multipurpose Cleaner",
      category: "Home Care",
      image: "assets/home-surface-care.jpg"
    }
  };

  const categories = [
    { name: "Personal Care", image: "assets/personal-care.jpg", note: "1 product", active: true },
    { name: "Home Care", image: "assets/home-surface-care.jpg", note: "4 products", active: true },
    { name: "Kitchen Care", image: "assets/dish-care.jpg", note: "Coming soon", active: false },
    { name: "Laundry Care", image: "assets/laundry-fabric-care.jpg", note: "Coming soon", active: false },
    { name: "Air Care", image: "assets/air-odour-care.jpg", note: "Coming soon", active: false },
    { name: "Vehicle Care", image: "assets/vehicle-care.jpg", note: "Coming soon", active: false }
  ];

  const style = document.createElement("style");

  style.textContent = `
    .aq-categories {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:18px;
      margin:25px 0;
    }

    .aq-categories[hidden],
    .aq-listing[hidden],
    .aq-detail[hidden],
    .products[hidden],
    .products li[hidden] {
      display:none !important;
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
    }

    .aq-category-card:hover {
      transform:translateY(-3px);
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

    .products .aq-product-actions {
      display:none !important;
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

    if (!section || !list) {
      console.error("AQUENIX: Homepage product section not found.");
      return;
    }

    // Create the hidden compatibility section if missing.
    let oldNav = document.getElementById("aq-category-area");

    if (!oldNav) {
      oldNav = document.createElement("div");
      oldNav.id = "aq-category-area";
      section.appendChild(oldNav);
    }

    oldNav.style.display = "none";

    const cards = [...list.querySelectorAll("li")];

    // Prepare the five launch products.
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
        image.alt = "AQUENIX " + item.name + " concept";
      }

      card.classList.add("aq-clickable-product");
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "View " + item.name);

      card.hidden = true;
    });

    // Build category homepage.
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

    // Build category listing screen.
    const listingView = document.createElement("div");
    listingView.className = "aq-listing";
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

    // Build product detail screen.
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

      window.scrollTo({ top: 0, behavior: "smooth" });
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
        "AQUENIX product concept. Formulation, pack size, price and final specifications are under development.";

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

      const canRefill = () =>
        typeof window.aqCanUseRefill === "function" &&
        window.aqCanUseRefill(id);

      refill.disabled = !canRefill();

      refill.title = refill.disabled
        ? "Purchase this product's Starter Kit first, or verify a previous purchase."
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

    // Refresh refill availability after cart/OTP changes.
    window.aqRefreshDetailRefill = () => {
      const button = detailView.querySelector(".aq-detail-refill");
      const title = detailView.querySelector("h3");

      if (!button || !title || detailView.hidden) return;

      const id = Object.keys(products).find(
        key => products[key].name === title.textContent
      );

      if (!id) return;

      const allowed =
        typeof window.aqCanUseRefill === "function" &&
        window.aqCanUseRefill(id);

      button.disabled = !allowed;
      button.title = allowed
        ? "Add this product's refill pack."
        : "Purchase this product's Starter Kit first, or verify a previous purchase.";
    };

    // Open product details from a product card.
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

    // AQUENIX logo returns to homepage categories.
    const brandLink = document.querySelector("header .brand");

    if (brandLink) {
      brandLink.addEventListener("click", event => {
        event.preventDefault();
        showAllCategories();
      });
    }

    // Search within the selected category.
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
