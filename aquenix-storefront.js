
/* AQUENIX PREMIUM CATEGORY-FIRST STOREFRONT
   Test branch only. Existing cart and OTP code stays unchanged. */

(() => {
  const products = {
    "01": {
      name: "Foaming Handwash",
      category: "Personal Care",
      price: 149,
      colour: "#168477"
    },
    "02": {
      name: "Floor Cleaner",
      category: "Home Care",
      price: 179,
      colour: "#138c78"
    },
    "04": {
      name: "Bathroom Cleaner",
      category: "Home Care",
      price: 179,
      colour: "#1684a0"
    },
    "05": {
      name: "Glass & Mirror Cleaner",
      category: "Home Care",
      price: 169,
      colour: "#2996a6"
    },
    "07": {
      name: "Multipurpose Cleaner",
      category: "Home Care",
      price: 189,
      colour: "#168477"
    }
  };

  const categories = [
    ["Personal Care", "assets/personal-care.jpg", "Foaming Handwash", true],
    ["Home Care", "assets/home-surface-care.jpg", "4 cleaning essentials", true],
    ["Kitchen Care", "assets/dish-care.jpg", "Coming soon", false],
    ["Laundry Care", "assets/laundry-fabric-care.jpg", "Coming soon", false],
    ["Air Care", "assets/air-odour-care.jpg", "Coming soon", false],
    ["Vehicle Care", "assets/vehicle-care.jpg", "Coming soon", false]
  ];

  const css = document.createElement("style");

  css.textContent = `
    .aq-categories {
      display:grid;
      grid-template-columns:repeat(3,1fr);
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

    .aq-demo-price {
      display:block;
      color:#173c36;
      font-weight:850;
      margin:8px 0;
    }

    .aq-demo-price small {
      color:#987a3c;
      font-weight:500;
      font-size:10px;
    }

    .products li[hidden] {
      display:none!important;
    }

    .product-image {
      object-fit:contain!important;
      background:#f4f8f6!important;
      padding:8px;
    }

    @media(max-width:760px) {
      .aq-categories {
        grid-template-columns:repeat(2,1fr);
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
    }

    @media(max-width:370px) {
      .aq-categories {
        grid-template-columns:1fr;
      }
    }
  `;

  document.head.appendChild(css);

  // Create premium transparent-bottle product illustration.
  function productImage(name, colour) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 400 420">
        <rect width="400" height="420" fill="#f4f8f6"/>
        <ellipse cx="200" cy="375" rx="90" ry="12"
                 fill="#cbdad4"/>
        <rect x="180" y="48" width="40" height="35"
              rx="5" fill="#171c1b"/>
        <rect x="165" y="78" width="70" height="22"
              rx="5" fill="#252c2a"/>
        <rect x="125" y="96" width="150" height="260"
              rx="28" fill="#dcece6" fill-opacity=".38"
              stroke="#9ebbb1" stroke-width="3"/>
        <path d="M130 270 Q200 250 270 270 L270 325
                 Q270 350 245 350 L155 350
                 Q130 350 130 325Z"
              fill="${colour}" fill-opacity=".35"/>
        <rect x="137" y="170" width="126" height="115"
              rx="3" fill="#ffffff" fill-opacity=".28"
              stroke="#aebfb9"/>
        <text x="200" y="201" text-anchor="middle"
              font-family="Arial" font-size="19"
              font-weight="bold" fill="#111">
          AQUENIX
        </text>
        <path d="M175 212 Q200 195 225 212 Q200 230 175 212Z"
              fill="${colour}"/>
        <text x="200" y="244" text-anchor="middle"
              font-family="Arial" font-size="11"
              font-weight="bold" fill="#17211f">
          ${name.toUpperCase()}
        </text>
        <text x="200" y="263" text-anchor="middle"
              font-family="Arial" font-size="8"
              fill="#43544e">
          TABLET + WATER REFILL
        </text>
        <text x="200" y="400" text-anchor="middle"
              font-family="Arial" font-size="10"
              fill="#64756f">
          CLEAR LABEL · BLACK & TEAL
        </text>
      </svg>`;

    return "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(svg);
  }

  function start() {
    const section = document.querySelector("#products .wrap");
    const list = document.querySelector(".products");
    const oldNav = document.getElementById("aq-category-area");

    if (!section || !list || !oldNav) return false;

    // Hide old text-only category navigation.
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

      card.dataset.category = item.category;
      card.dataset.productName = item.name.toLowerCase();

      const image = card.querySelector(".product-image");

      if (image) {
        image.src = productImage(item.name, item.colour);
        image.alt = "AQUENIX " + item.name +
          " transparent bottle and clear label concept";
      }

      const title = card.querySelector(".product-name");
      if (title) title.textContent = item.name;

      const price = document.createElement("span");
      price.className = "aq-demo-price";
      price.innerHTML = "₹" + item.price +
        ' <small>Illustrative price only</small>';

      const status = card.querySelector(".product-status");
      card.insertBefore(price, status);

      card.hidden = true;
    });

    // Category tiles.
    const categoryGrid = document.createElement("div");
    categoryGrid.className = "aq-categories";

    categories.forEach(category => {
      const [name, image, description, active] = category;

      const button = document.createElement("button");
      button.className = "aq-category-card";
      button.type = "button";
      button.disabled = !active;

      const photo = document.createElement("img");
      photo.src = image;
      photo.alt = name;

      const title = document.createElement("strong");
      title.textContent = name;

      const note = document.createElement("small");
      note.textContent = description;

      button.append(photo, title, note);

      if (active) {
        button.addEventListener("click", () => {
          showCategory(name);
        });
      }

      categoryGrid.appendChild(button);
    });

    section.insertBefore(categoryGrid, oldNav);

    // Product category screen.
    const productView = document.createElement("div");
    productView.hidden = true;

    const back = document.createElement("button");
    back.className = "aq-back";
    back.textContent = "← Back to All Categories";

    const heading = document.createElement("h3");
    heading.className = "aq-store-title";

    const search = document.createElement("input");
    search.className = "aq-store-search";
    search.placeholder = "Search products";
    search.type = "search";

    productView.append(back, heading, search);
    section.insertBefore(productView, list);

    function showAllCategories() {
      categoryGrid.hidden = false;
      productView.hidden = true;
      list.hidden = true;

      cards.forEach(card => card.hidden = true);
    }

    function showCategory(name) {
      categoryGrid.hidden = true;
      productView.hidden = false;
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

    back.addEventListener("click", showAllCategories);

    search.addEventListener("input", () => {
      cards.forEach(card => {
        if (card.dataset.category === heading.textContent) {
          card.hidden = !card.dataset.productName.includes(
            search.value.trim().toLowerCase()
          );
        }
      });
    });

    showAllCategories();
    return true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
