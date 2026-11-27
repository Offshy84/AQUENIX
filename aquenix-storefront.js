
/* AQUENIX STOREFRONT
   Dedicated category and product screens
   One-step Back navigation
   Browser Back button support
   Existing cart and OTP integration preserved
*/

(() => {
  "use strict";

  const products = {
    "01": {
      name: "Foaming Handwash",
      category: "Personal Care",
      image: "assets/personal-care.jpg",
      description: "AQUENIX foaming handwash concept, designed for a reusable foaming-pump bottle and a matching refill format.",
      format: "Planned format: Foaming pump bottle + refill tablet."
    },
    "02": {
      name: "Floor Cleaner",
      category: "Home Care",
      image: "assets/home-surface-care.jpg",
      description: "AQUENIX floor cleaner concept for everyday household floor-cleaning needs.",
      format: "Planned format: Reusable 1 L bottle + refill tablet."
    },
    "04": {
      name: "Bathroom Cleaner",
      category: "Home Care",
      image: "assets/toilet-specialty-care.jpg",
      description: "AQUENIX bathroom cleaner concept for bathroom surfaces and routine cleaning.",
      format: "Planned format: Reusable spray bottle + refill tablet."
    },
    "05": {
      name: "Glass & Mirror Cleaner",
      category: "Home Care",
      image: "assets/appliance-care.jpg",
      description: "AQUENIX glass and mirror cleaner concept for household glass and mirror surfaces.",
      format: "Planned format: Reusable spray bottle + refill tablet."
    },
    "07": {
      name: "Multipurpose Cleaner",
      category: "Home Care",
      image: "assets/home-surface-care.jpg",
      description: "AQUENIX multipurpose cleaner concept for selected everyday household cleaning tasks.",
      format: "Planned format: Reusable spray bottle + refill tablet."
    }
  };

  const categories = [
    {
      name: "Personal Care",
      image: "assets/personal-care.jpg",
      note: "1 product",
      active: true
    },
    {
      name: "Home Care",
      image: "assets/home-surface-care.jpg",
      note: "4 products",
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
    /* Focused shopping experience */

    body.aq-shopping-mode main > section:not(#products),
    body.aq-shopping-mode .proof,
    body.aq-shopping-mode footer {
      display:none !important;
    }

    body.aq-shopping-mode #products {
      min-height:calc(100vh - 76px);
      padding:30px 0 55px;
      background:#f5f8f7;
    }

    body.aq-shopping-mode #products > .wrap {
      width:min(1160px,calc(100% - 36px));
      margin:auto;
    }

    .aq-categories[hidden],
    .aq-listing[hidden],
    .aq-detail[hidden],
    .products[hidden],
    .products li[hidden],
    .aq-section-heading[hidden] {
      display:none !important;
    }

    .aq-section-heading {
      text-align:left;
      margin:5px 0 24px;
    }

    .aq-section-heading h2 {
      color:#173c36;
      font-size:clamp(28px,4vw,40px);
      margin:8px 0;
    }

    .aq-section-heading p {
      color:#687a74;
      max-width:650px;
    }

    .aq-categories {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:18px;
      margin:20px 0;
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
      transition:transform .2s,box-shadow .2s;
    }

    .aq-category-card:hover {
      transform:translateY(-3px);
      box-shadow:0 12px 28px #102c3820;
    }

    .aq-category-card:disabled {
      cursor:default;
      opacity:.65;
    }

    .aq-category-card img {
      width:100%;
      height:190px;
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

    /* Navigation */

    .aq-back {
      display:inline-block;
      padding:11px 19px;
      border:1px solid #173c36;
      border-radius:25px;
      background:white;
      color:#173c36;
      font-size:14px;
      font-weight:700;
      cursor:pointer;
      margin:0 0 20px;
    }

    .aq-back:hover {
      background:#eaf3f0;
    }

    .aq-store-title {
      color:#173c36;
      font-size:32px;
      margin:0 0 5px;
    }

    .aq-store-subtitle {
      color:#687a74;
      margin:0 0 18px;
    }

    .aq-store-search {
      width:100%;
      max-width:430px;
      padding:13px 17px;
      border:1px solid #cbd9d5;
      border-radius:25px;
      margin:5px 0 22px;
      font:inherit;
      background:white;
    }

    /* Category product cards */

    .products {
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:20px;
      list-style:none;
      padding:0;
      margin:10px 0 25px;
    }

    .products li {
      cursor:pointer;
    }

    .products li.aq-clickable-product:focus-visible {
      outline:3px solid #087f75;
      outline-offset:3px;
    }

    .products .aq-product-actions {
      display:none !important;
    }

    /* Dedicated product detail screen */

    .aq-detail {
      width:100%;
      background:white;
      border:1px solid #e0e9e5;
      border-radius:22px;
      padding:28px;
      margin:0 auto;
      box-shadow:0 8px 30px #102c3810;
    }

    .aq-detail-grid {
      display:grid;
      grid-template-columns:1.1fr .9fr;
      gap:40px;
      align-items:center;
      min-height:480px;
    }

    .aq-detail-image-wrap {
      width:100%;
      min-height:390px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#f4f8f6;
      border-radius:18px;
      overflow:hidden;
    }

    .aq-detail-image {
      width:100%;
      height:430px;
      object-fit:contain;
      display:block;
    }

    .aq-detail-info {
      padding:12px 5px;
    }

    .aq-detail-category {
      display:inline-block;
      background:#e8f1ed;
      color:#153d35;
      padding:7px 13px;
      border-radius:20px;
      font-size:12px;
      font-weight:700;
      margin:5px 0 12px;
    }

    .aq-detail h3 {
      color:#173c36;
      font-size:clamp(27px,4vw,39px);
      line-height:1.2;
      margin:8px 0 15px;
    }

    .aq-detail-description {
      color:#566a63;
      font-size:16px;
      line-height:1.8;
      margin:12px 0;
    }

    .aq-detail-format {
      color:#173c36;
      background:#f1f7f4;
      border-left:4px solid #087f75;
      padding:13px 15px;
      border-radius:5px;
      margin:20px 0;
      font-size:14px;
    }

    .aq-detail-status {
      display:inline-block;
      color:#80652b;
      background:#fff7e6;
      border:1px solid #eee0bd;
      border-radius:20px;
      padding:7px 12px;
      font-size:12px;
      margin:5px 0;
    }

    .aq-detail-actions {
      display:flex;
      flex-wrap:wrap;
      gap:12px;
      margin-top:25px;
    }

    .aq-detail-actions button {
      flex:1;
      min-width:145px;
      padding:15px 18px;
      border-radius:10px;
      border:1px solid #153d35;
      cursor:pointer;
      font-size:15px;
      font-weight:750;
    }

    .aq-detail-starter {
      background:#153d35;
      color:white;
    }

    .aq-detail-starter:hover {
      background:#087f75;
    }

    .aq-detail-refill {
      background:white;
      color:#153d35;
    }

    .aq-detail-refill:hover:not(:disabled) {
      background:#eaf3f0;
    }

    .aq-detail-refill:disabled {
      opacity:.45;
      cursor:not-allowed;
      background:#eee;
      color:#666;
      border-color:#aaa;
    }

    .aq-detail-small-note {
      color:#84918c;
      font-size:12px;
      margin-top:18px;
    }

    .aq-no-results {
      color:#687a74;
      padding:25px 0;
    }

    @media(max-width:760px) {
      body.aq-shopping-mode #products {
        min-height:calc(100vh - 66px);
        padding:22px 0 35px;
      }

      .aq-categories {
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }

      .aq-category-card img {
        height:145px;
      }

      .aq-category-card strong {
        font-size:14px;
      }

      .products {
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }

      .aq-detail {
        padding:14px;
        border-radius:16px;
      }

      .aq-detail-grid {
        grid-template-columns:1fr;
        gap:15px;
        min-height:0;
      }

      .aq-detail-image-wrap {
        min-height:250px;
      }

      .aq-detail-image {
        height:290px;
      }

      .aq-detail-info {
        padding:5px;
      }

      .aq-detail h3 {
        font-size:27px;
      }

      .aq-detail-description {
        font-size:14px;
      }

      .aq-detail-actions {
        flex-direction:column;
      }

      .aq-detail-actions button {
        width:100%;
      }

      .aq-store-title {
        font-size:27px;
      }
    }

    @media(max-width:370px) {
      .aq-categories,
      .products {
        grid-template-columns:1fr;
      }

      .aq-category-card img {
        height:180px;
      }
    }
  `;

  document.head.appendChild(style);

  function start() {
    const section = document.querySelector("#products .wrap");
    const list = document.querySelector(".products");
    const sectionHeading = section?.querySelector(".section-heading");

    if (!section || !list || !sectionHeading) {
      console.error("AQUENIX: Product section not found.");
      return;
    }

    sectionHeading.classList.add("aq-section-heading");

    let oldNav = document.getElementById("aq-category-area");

    if (!oldNav) {
      oldNav = document.createElement("div");
      oldNav.id = "aq-category-area";
      section.appendChild(oldNav);
    }

    oldNav.style.display = "none";

    const cards = [...list.querySelectorAll("li")];

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

    // Homepage category cards

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
          navigate({
            view: "category",
            category: item.name
          });
        });
      }

      categoryGrid.appendChild(button);
    });

    section.insertBefore(categoryGrid, oldNav);

    // Separate category page

    const listingView = document.createElement("div");
    listingView.className = "aq-listing";
    listingView.hidden = true;

    const categoryBack = document.createElement("button");
    categoryBack.type = "button";
    categoryBack.className = "aq-back";
    categoryBack.textContent = "← Back to Categories";

    const categoryHeading = document.createElement("h2");
    categoryHeading.className = "aq-store-title";

    const categorySubtitle = document.createElement("p");
    categorySubtitle.className = "aq-store-subtitle";
    categorySubtitle.textContent =
      "Choose a product to explore its details.";

    const search = document.createElement("input");
    search.className = "aq-store-search";
    search.type = "search";
    search.placeholder = "Search products";
    search.setAttribute("aria-label", "Search products");

    const noResults = document.createElement("p");
    noResults.className = "aq-no-results";
    noResults.textContent = "No matching products found.";
    noResults.hidden = true;

    listingView.append(
      categoryBack,
      categoryHeading,
      categorySubtitle,
      search,
      noResults
    );

    section.insertBefore(listingView, list);

    // Separate product detail page

    const detailView = document.createElement("div");
    detailView.className = "aq-detail";
    detailView.hidden = true;

    section.insertBefore(detailView, list);

    // Show homepage

    function showHome() {
      document.body.classList.add("aq-shopping-mode");

      sectionHeading.hidden = false;
      categoryGrid.hidden = false;
      listingView.hidden = true;
      detailView.hidden = true;
      list.hidden = true;

      cards.forEach(card => {
        card.hidden = true;
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Show selected category only

    function showCategory(name) {
      document.body.classList.add("aq-shopping-mode");

      sectionHeading.hidden = true;
      categoryGrid.hidden = true;
      listingView.hidden = false;
      detailView.hidden = true;
      list.hidden = false;

      categoryHeading.textContent = name;
      search.value = "";

      let visibleCount = 0;

      cards.forEach(card => {
        const visible = card.dataset.category === name;
        card.hidden = !visible;
        if (visible) visibleCount++;
      });

      noResults.hidden = visibleCount !== 0;

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Show one selected product in a dedicated screen

    function showProduct(id) {
      const item = products[id];
      if (!item) return;

      document.body.classList.add("aq-shopping-mode");

      sectionHeading.hidden = true;
      categoryGrid.hidden = true;
      listingView.hidden = true;
      list.hidden = true;
      detailView.hidden = false;

      detailView.replaceChildren();

      const grid = document.createElement("div");
      grid.className = "aq-detail-grid";

      const imageWrap = document.createElement("div");
      imageWrap.className = "aq-detail-image-wrap";

      const image = document.createElement("img");
      image.className = "aq-detail-image";
      image.src = item.image;
      image.alt = "AQUENIX " + item.name + " product concept";

      imageWrap.appendChild(image);

      const info = document.createElement("div");
      info.className = "aq-detail-info";

      const backButton = document.createElement("button");
      backButton.type = "button";
      backButton.className = "aq-back";
      backButton.textContent = "← Back to " + item.category;

      backButton.addEventListener("click", () => {
        goBack();
      });

      const category = document.createElement("span");
      category.className = "aq-detail-category";
      category.textContent = item.category;

      const title = document.createElement("h3");
      title.textContent = item.name;

      const description = document.createElement("p");
      description.className = "aq-detail-description";
      description.textContent = item.description;

      const format = document.createElement("div");
      format.className = "aq-detail-format";
      format.textContent = item.format;

      const status = document.createElement("span");
      status.className = "aq-detail-status";
      status.textContent = "Development-stage product concept";

      const actions = document.createElement("div");
      actions.className = "aq-detail-actions";

      const starter = document.createElement("button");
      starter.type = "button";
      starter.className = "aq-detail-starter";
      starter.textContent = "Starter Kit";

      starter.addEventListener("click", () => {
        if (typeof window.aqAddProduct === "function") {
          window.aqAddProduct(id, "starter");
        } else {
          alert("Cart is still loading. Please refresh the page.");
        }
      });

      const refill = document.createElement("button");
      refill.type = "button";
      refill.className = "aq-detail-refill";
      refill.textContent = "Refill";

      const canRefill = () =>
        typeof window.aqCanUseRefill === "function" &&
        window.aqCanUseRefill(id);

      refill.disabled = !canRefill();

      refill.title = refill.disabled
        ? "Purchase this product's Starter Kit first, or verify a previous purchase."
        : "Add this product's refill pack.";

      refill.addEventListener("click", () => {
        if (typeof window.aqAddProduct === "function") {
          window.aqAddProduct(id, "refill");
        }
      });

      const smallNote = document.createElement("p");
      smallNote.className = "aq-detail-small-note";
      smallNote.textContent =
        "Product formulation, testing, packaging, final price and specifications are still under development. Not available for sale yet.";

      actions.append(starter, refill);

      info.append(
        backButton,
        category,
        title,
        description,
        format,
        status,
        actions,
        smallNote
      );

      grid.append(imageWrap, info);
      detailView.appendChild(grid);

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Keep refill button updated after cart and OTP activity

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

    // Navigation history

    function renderRoute(route) {
      if (!route || route.view === "home") {
        showHome();
        return;
      }

      if (route.view === "category") {
        showCategory(route.category);
        return;
      }

      if (route.view === "product") {
        showProduct(route.id);
        return;
      }

      showHome();
    }

    function navigate(route) {
      const url = route.view === "home"
        ? "#products"
        : route.view === "category"
          ? "#category"
          : "#product-" + route.id;

      history.pushState(
        { aqRoute: true, ...route },
        "",
        url
      );

      renderRoute(route);
    }

    function goBack() {
      if (history.state?.aqRoute) {
        history.back();
      } else {
        navigate({ view: "home" });
      }
    }

    window.addEventListener("popstate", event => {
      const route = event.state;

      if (route?.aqRoute) {
        renderRoute(route);
      } else {
        renderRoute({ view: "home" });
      }
    });

    // Product card click

    cards.forEach(card => {
      const open = () => {
        navigate({
          view: "product",
          id: card.dataset.productId,
          category: card.dataset.category
        });
      };

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

    categoryBack.addEventListener("click", goBack);

    // Search inside the selected category

    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach(card => {
        if (card.dataset.category !== categoryHeading.textContent) {
          card.hidden = true;
          return;
        }

        const matches =
          card.dataset.productName.includes(query);

        card.hidden = !matches;

        if (matches) visibleCount++;
      });

      noResults.hidden = visibleCount !== 0;
    });

    // AQUENIX logo returns to category homepage

    const brandLink = document.querySelector("header .brand");

    if (brandLink) {
      brandLink.addEventListener("click", event => {
        event.preventDefault();
        navigate({ view: "home" });
      });
    }

    // Start at homepage or restore an existing route

    if (history.state?.aqRoute) {
      renderRoute(history.state);
    } else {
      history.replaceState(
        { aqRoute: true, view: "home" },
        "",
        "#products"
      );

      showHome();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
