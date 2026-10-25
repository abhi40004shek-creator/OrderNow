
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  console.log("OrderNow frontend initialized successfully.");

  // ========================================
  // Product Quantity, Total Price & Savings
  // ========================================

  const quantityInput = document.getElementById("product-quantity");
  const totalPriceElement = document.getElementById("product-total-price");
  const totalSavingsElement = document.getElementById("product-total-savings");

  if (quantityInput && totalPriceElement && totalSavingsElement) {
    const unitPrice = Number(totalPriceElement.dataset.unitPrice);
    const unitSavings = Number(totalSavingsElement.dataset.unitSavings);

    const updateTotals = () => {
      const quantity = Number(quantityInput.value);
      const maxQuantity = Number(quantityInput.max);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > maxQuantity
      ) {
        return;
      }

      totalPriceElement.textContent = `₹${(
        unitPrice * quantity
      ).toLocaleString("en-IN")}`;

      totalSavingsElement.textContent = `₹${(
        unitSavings * quantity
      ).toLocaleString("en-IN")}`;
    };

    quantityInput.addEventListener("input", updateTotals);
    quantityInput.addEventListener("change", updateTotals);
  }

  // ========================================
  // Recently Viewed Products - Save
  // ========================================

  const productInfo = document.querySelector(".product-details-info");

  if (productInfo) {
    const currentProduct = {
      id: productInfo.dataset.productId,
      name: productInfo.dataset.productName,
      image: productInfo.dataset.productImage,
      category: productInfo.dataset.productCategory,
      price: Number(productInfo.dataset.productPrice),
    };

    try {
      const storedProducts = JSON.parse(
        localStorage.getItem("ordernow-recently-viewed") || "[]"
      );

      const validProducts = Array.isArray(storedProducts)
        ? storedProducts.filter(
            (product) =>
              product &&
              typeof product.id === "string" &&
              typeof product.name === "string"
          )
        : [];

      const recentlyViewed = [
        currentProduct,
        ...validProducts.filter(
          (product) => product.id !== currentProduct.id
        ),
      ].slice(0, 5);

      localStorage.setItem(
        "ordernow-recently-viewed",
        JSON.stringify(recentlyViewed)
      );
    } catch (error) {
      console.error("Could not save recently viewed products:", error);
    }
  }

  // ========================================
  // Render Recently Viewed Products
  // ========================================

  const recentlyViewedSection = document.getElementById(
    "recently-viewed-section"
  );

  const recentlyViewedGrid = document.getElementById(
    "recently-viewed-grid"
  );

  if (recentlyViewedSection && recentlyViewedGrid) {
    try {
      const recentlyViewed = JSON.parse(
        localStorage.getItem("ordernow-recently-viewed") || "[]"
      );

      const validProducts = Array.isArray(recentlyViewed)
        ? recentlyViewed.filter(
            (product) =>
              product &&
              typeof product.id === "string" &&
              typeof product.name === "string" &&
              typeof product.image === "string" &&
              typeof product.category === "string" &&
              Number.isFinite(product.price)
          )
        : [];

      if (validProducts.length > 0) {
        recentlyViewedGrid.replaceChildren();

        validProducts.forEach((product) => {
          const card = document.createElement("article");
          card.className = "recently-viewed-card";

          const link = document.createElement("a");
          link.href = `/products/${encodeURIComponent(product.id)}`;
          link.className = "recently-viewed-product-link";

          const image = document.createElement("span");
          image.className = "recently-viewed-product-image";
          image.textContent = product.image;
          image.setAttribute("aria-hidden", "true");

          const name = document.createElement("h3");
          name.textContent = product.name;

          const category = document.createElement("p");
          category.className = "recently-viewed-product-category";
          category.textContent = product.category;

          const price = document.createElement("p");
          price.className = "recently-viewed-product-price";
          price.textContent = `₹${product.price.toLocaleString("en-IN")}`;

          link.append(image, name, category, price);
          card.append(link);
          recentlyViewedGrid.append(card);
        });

        recentlyViewedSection.hidden = false;
      }
    } catch (error) {
      console.error("Could not display recently viewed products:", error);
    }
  }

  // ========================================
  // Wishlist - Add Product
  // ========================================

  const wishlistButton = document.getElementById("add-to-wishlist");
  const wishlistFeedback = document.getElementById("wishlist-feedback");

  if (wishlistButton && productInfo) {
    const currentProduct = {
      id: productInfo.dataset.productId,
      name: productInfo.dataset.productName,
      image: productInfo.dataset.productImage,
      category: productInfo.dataset.productCategory,
      price: Number(productInfo.dataset.productPrice),
    };

    const wishlistKey = "ordernow-wishlist";

    // Check whether this product is already in the wishlist.
    const updateWishlistButton = () => {
      try {
        const storedWishlist = JSON.parse(
          localStorage.getItem(wishlistKey) || "[]"
        );

        const wishlist = Array.isArray(storedWishlist)
          ? storedWishlist
          : [];

        const alreadyAdded = wishlist.some(
          (product) => product && product.id === currentProduct.id
        );

        wishlistButton.textContent = alreadyAdded
          ? "♥ Added to Wishlist"
          : "♡ Add to Wishlist";

        wishlistButton.setAttribute(
          "aria-pressed",
          String(alreadyAdded)
        );
      } catch (error) {
        console.error("Could not read wishlist:", error);
      }
    };

    updateWishlistButton();

    wishlistButton.addEventListener("click", () => {
      try {
        const storedWishlist = JSON.parse(
          localStorage.getItem(wishlistKey) || "[]"
        );

        const wishlist = Array.isArray(storedWishlist)
          ? storedWishlist.filter(
              (product) =>
                product &&
                typeof product.id === "string" &&
                typeof product.name === "string"
            )
          : [];

        const alreadyAdded = wishlist.some(
          (product) => product.id === currentProduct.id
        );

        if (alreadyAdded) {
          if (wishlistFeedback) {
            wishlistFeedback.textContent =
              "This product is already in your wishlist.";
          }

          updateWishlistButton();
          return;
        }

        wishlist.push(currentProduct);

        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));

        updateWishlistButton();

        if (wishlistFeedback) {
          wishlistFeedback.textContent =
            "Product added to your wishlist successfully.";
        }
      } catch (error) {
        console.error("Could not save wishlist:", error);

        if (wishlistFeedback) {
          wishlistFeedback.textContent =
            "Could not save your wishlist. Please try again.";
        }
      }
    });
  }

  
  // Wishlist Page - Render Saved Products & Remove Items
  const wishlistGrid = document.getElementById("wishlist-grid");
  const wishlistEmpty = document.getElementById("wishlist-empty");

  if (wishlistGrid && wishlistEmpty) {
    const wishlistKey = "ordernow-wishlist";

    function renderWishlist() {
      try {
        const storedWishlist = JSON.parse(
          localStorage.getItem(wishlistKey) || "[]"
        );

        const wishlist = Array.isArray(storedWishlist)
          ? storedWishlist.filter(
              (product) =>
                product &&
                typeof product.id === "string" &&
                typeof product.name === "string" &&
                typeof product.image === "string" &&
                typeof product.category === "string" &&
                Number.isFinite(product.price)
            )
          : [];

        wishlistGrid.replaceChildren();

        wishlist.forEach((product) => {
          const card = document.createElement("article");
          card.className = "wishlist-card";

          const link = document.createElement("a");
          link.className = "wishlist-product-link";
          link.href = `/products/${encodeURIComponent(product.id)}`;

          const image = document.createElement("span");
          image.className = "wishlist-product-image";
          image.textContent = product.image;
          image.setAttribute("aria-hidden", "true");

          const category = document.createElement("p");
          category.className = "wishlist-product-category";
          category.textContent = product.category;

          const name = document.createElement("h2");
          name.textContent = product.name;

          const price = document.createElement("p");
          price.className = "wishlist-product-price";
          price.textContent = `₹${product.price.toLocaleString("en-IN")}`;

          link.append(image, category, name, price);

          const removeButton = document.createElement("button");
          removeButton.type = "button";
          removeButton.className = "wishlist-remove-button";
          removeButton.textContent = "Remove";
          removeButton.setAttribute(
            "aria-label",
            `Remove ${product.name} from wishlist`
          );

          removeButton.addEventListener("click", () => {
            try {
              const latestWishlist = JSON.parse(
                localStorage.getItem(wishlistKey) || "[]"
              );

              const updatedWishlist = Array.isArray(latestWishlist)
                ? latestWishlist.filter(
                    (item) => item && item.id !== product.id
                  )
                : [];

              localStorage.setItem(
                wishlistKey,
                JSON.stringify(updatedWishlist)
              );

              renderWishlist();
            } catch (error) {
              console.error("Could not remove wishlist product:", error);
            }
          });

          card.append(link, removeButton);
          wishlistGrid.append(card);
        });

        wishlistEmpty.hidden = wishlist.length > 0;
        wishlistGrid.hidden = wishlist.length === 0;
      } catch (error) {
        console.error("Could not display wishlist products:", error);
      }
    }

    renderWishlist();
  }



  // Shopping Cart: Add product to localStorage
  const addToCartButton = document.getElementById("add-to-cart-button");

  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      const productDetails = document.querySelector(".product-details-info");
      const feedback = document.getElementById("cart-feedback");

      if (!productDetails || !feedback) {
        return;
      }

      const product = {
        id: productDetails.dataset.productId,
        name: productDetails.dataset.productName,
        image: productDetails.dataset.productImage,
        category: productDetails.dataset.productCategory,
        price: Number(productDetails.dataset.productPrice),
        stock: Number(productDetails.dataset.productStock),
        quantity: 1,
      };

      if (
        !product.id ||
        !product.name ||
        !Number.isFinite(product.price) ||
        product.price < 0 ||
        !Number.isInteger(product.stock) ||
        product.stock < 0
      ) {
        feedback.textContent =
          "Unable to add this product. Please try again.";
        return;
      }

      if (product.stock === 0) {
        feedback.textContent = "This product is out of stock.";
        return;
      }

      let cart = [];

      try {
        const savedCart = localStorage.getItem("ordernow-cart");
        cart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(cart)) {
          cart = [];
        }
      } catch {
        feedback.textContent =
          "Unable to read your cart. Please try again.";
        return;
      }

      const existingItem = cart.find(
        (item) => item && item.id === product.id,
      );

      if (existingItem) {
        if (
          !Number.isInteger(existingItem.quantity) ||
          existingItem.quantity < 1
        ) {
          existingItem.quantity = 1;
        }

        existingItem.stock = product.stock;

        if (existingItem.quantity >= product.stock) {
          feedback.textContent =
            "You have reached the available stock limit.";
          return;
        }

        existingItem.quantity += 1;
      } else {
        cart.push(product);
      }

      try {
        localStorage.setItem("ordernow-cart", JSON.stringify(cart));
        feedback.textContent = `${product.name} added to your cart!`;
      } catch {
        feedback.textContent =
          "Unable to save your cart. Please try again.";
      }
    });
  }

  // Shopping Cart: Render saved cart items
  const cartItemsContainer = document.getElementById("cart-items");

  if (cartItemsContainer) {
    const cartEmpty = document.getElementById("cart-empty");
    const cartItemCount = document.getElementById("cart-item-count");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartTotal = document.getElementById("cart-total");
    const cartShipping = document.getElementById("cart-shipping");
    const checkoutButton = document.getElementById("cart-checkout-button");

    function updateCartQuantity(productId, change) {
      try {
        const savedCart = localStorage.getItem("ordernow-cart");
        const cart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(cart)) {
          return;
        }

        const item = cart.find(
          (cartItem) => cartItem.id === productId,
        );

        if (
          !item ||
          !Number.isInteger(item.quantity) ||
          !Number.isInteger(item.stock) ||
          item.stock < 0
        ) {
          return;
        }

        const newQuantity = item.quantity + change;

        if (newQuantity < 1 || newQuantity > item.stock) {
          return;
        }

        item.quantity = newQuantity;

        localStorage.setItem("ordernow-cart", JSON.stringify(cart));
        renderCart();
      } catch {
        console.error("Unable to update cart quantity.");
      }
    }

    function renderCart() {
      let cart = [];

      try {
        const savedCart = localStorage.getItem("ordernow-cart");
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];

        cart = Array.isArray(parsedCart) ? parsedCart : [];
      } catch {
        cart = [];
      }

      cartItemsContainer.replaceChildren();

      let totalQuantity = 0;
      let subtotal = 0;

      cart.forEach((item) => {
        if (
          !item ||
          typeof item.id !== "string" ||
          typeof item.name !== "string" ||
          !Number.isFinite(item.price) ||
          item.price < 0 ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          !Number.isInteger(item.stock) ||
          item.stock < 0
        ) {
          return;
        }

        if (item.quantity > item.stock) {
          item.quantity = item.stock;
        }

        if (item.quantity < 1 || item.stock === 0) {
          return;
        }

        totalQuantity += item.quantity;
        subtotal += item.price * item.quantity;

        const card = document.createElement("article");
        card.className = "cart-item";

        const image = document.createElement("div");
        image.className = "cart-item-image";
        image.setAttribute("aria-hidden", "true");
        image.textContent = item.image || "🛍️";

        const details = document.createElement("div");
        details.className = "cart-item-details";

        const name = document.createElement("h3");
        name.className = "cart-item-name";
        name.textContent = item.name;

        const category = document.createElement("p");
        category.className = "cart-item-category";
        category.textContent = item.category || "Product";

        const price = document.createElement("p");
        price.className = "cart-item-price";
        price.textContent = `₹${item.price.toLocaleString("en-IN")}`;

        const quantityControls = document.createElement("div");
        quantityControls.className = "cart-quantity-controls";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.className = "cart-quantity-button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute(
          "aria-label",
          `Decrease ${item.name} quantity`,
        );
        decreaseButton.disabled = item.quantity <= 1;

        const quantityLabel = document.createElement("span");
        quantityLabel.className = "cart-quantity-value";
        quantityLabel.textContent = item.quantity;

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.className = "cart-quantity-button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute(
          "aria-label",
          `Increase ${item.name} quantity`,
        );
        increaseButton.disabled = item.quantity >= item.stock;

        decreaseButton.addEventListener("click", () => {
          updateCartQuantity(item.id, -1);
        });

        increaseButton.addEventListener("click", () => {
          updateCartQuantity(item.id, 1);
        });

        quantityControls.append(
          decreaseButton,
          quantityLabel,
          increaseButton,
        );

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "cart-remove-button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
          try {
            const savedCart = localStorage.getItem("ordernow-cart");
            const currentCart = savedCart ? JSON.parse(savedCart) : [];

            if (!Array.isArray(currentCart)) {
              return;
            }

            const updatedCart = currentCart.filter(
              (cartItem) => cartItem.id !== item.id,
            );

            localStorage.setItem(
              "ordernow-cart",
              JSON.stringify(updatedCart),
            );

            renderCart();
          } catch {
            console.error("Unable to remove cart item.");
          }
        });

        details.append(
          name,
          category,
          price,
          quantityControls,
          removeButton,
        );

        card.append(image, details);
        cartItemsContainer.append(card);
      });

      try {
        localStorage.setItem("ordernow-cart", JSON.stringify(cart));
      } catch {
        console.error("Unable to save cart changes.");
      }

      cartItemCount.textContent =
        `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"}`;

      cartSubtotal.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
      cartTotal.textContent = `₹${subtotal.toLocaleString("en-IN")}`;

      if (cartShipping) {
        cartShipping.textContent = "Calculated at checkout";
      }

      cartEmpty.hidden = totalQuantity > 0;
      cartItemsContainer.hidden = totalQuantity === 0;
      checkoutButton.disabled = totalQuantity === 0;
    }

    // Proceed from Cart to Checkout
    checkoutButton.addEventListener("click", () => {
      if (checkoutButton.disabled) {
        return;
      }

      window.location.href = "/checkout";
    });

    renderCart();
  }
});

