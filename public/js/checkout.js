
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const checkoutItems = document.getElementById("checkout-items");

  // Run only on the checkout page.
  if (!checkoutItems) {
    return;
  }

  const subtotalElement = document.getElementById("checkout-subtotal");
  const totalElement = document.getElementById("checkout-total");
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutFeedback = document.getElementById("checkout-feedback");
  const placeOrderButton = document.getElementById("place-order-button");

  function renderCheckoutSummary() {
    let cart = [];

    try {
      const savedCart = localStorage.getItem("ordernow-cart");
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      cart = Array.isArray(parsedCart) ? parsedCart : [];
    } catch {
      cart = [];
    }

    checkoutItems.replaceChildren();

    let subtotal = 0;
    let totalQuantity = 0;

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
        item.stock < item.quantity
      ) {
        return;
      }

      subtotal += item.price * item.quantity;
      totalQuantity += item.quantity;

      const row = document.createElement("div");
      row.className = "checkout-item";

      const name = document.createElement("span");
      name.textContent = `${item.name} × ${item.quantity}`;

      const price = document.createElement("span");
      price.textContent = `₹${(item.price * item.quantity).toLocaleString("en-IN")}`;

      row.append(name, price);
      checkoutItems.append(row);
    });

    if (totalQuantity === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Your cart is empty. Add products before checkout.";
      checkoutItems.append(emptyMessage);
    }

    if (subtotalElement) {
      subtotalElement.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
    }

    if (totalElement) {
      totalElement.textContent = `₹${subtotal.toLocaleString("en-IN")}`;
    }

    if (placeOrderButton) {
      placeOrderButton.disabled = totalQuantity === 0;
    }

    return totalQuantity > 0;
  }

  renderCheckoutSummary();

  // Refresh the summary if the cart changes in another browser tab.
  window.addEventListener("storage", (event) => {
    if (event.key === "ordernow-cart") {
      renderCheckoutSummary();
    }
  });

  // Order submission will be implemented in a later step.
  if (checkoutForm) {
    
checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (checkoutFeedback) {
    checkoutFeedback.textContent = "";
  }

  if (!checkoutForm.checkValidity()) {
    checkoutForm.reportValidity();
    return;
  }

  const formData = new FormData(checkoutForm);

  const customer = {
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    postalCode: String(formData.get("postalCode") || "").trim(),
  };

  if (
    !customer.fullName ||
    !customer.email ||
    !customer.phone ||
    !customer.address ||
    !customer.city ||
    !/^[1-9][0-9]{5}$/.test(customer.postalCode)
  ) {
    if (checkoutFeedback) {
      checkoutFeedback.textContent =
        "Please enter valid delivery details and a 6-digit PIN code.";
    }
    return;
  }

  let cart = [];

  try {
    const savedCart = localStorage.getItem("ordernow-cart");
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];

    if (!Array.isArray(parsedCart)) {
      throw new Error("Invalid cart data.");
    }

    cart = parsedCart;
  } catch {
    if (checkoutFeedback) {
      checkoutFeedback.textContent =
        "Unable to read your cart. Please review your cart and try again.";
    }
    return;
  }

  const items = cart.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  if (items.length === 0) {
    if (checkoutFeedback) {
      checkoutFeedback.textContent =
        "Your cart is empty. Add products before checkout.";
    }
    return;
  }

  if (placeOrderButton) {
    placeOrderButton.disabled = true;
    placeOrderButton.textContent = "Submitting...";
  }

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...customer,
        items,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Unable to submit your order.");
    }

   localStorage.removeItem("ordernow-cart");

    window.location.href =
        `/api/orders/${encodeURIComponent(result.order.id)}/confirmation`;
    } 
    catch (error) {
    if (checkoutFeedback) {
      checkoutFeedback.textContent =
        error.message || "Something went wrong. Please try again.";
    }
  } finally {
    if (placeOrderButton) {
      placeOrderButton.textContent = "Continue to Place Order";
      renderCheckoutSummary();
    }
  }
});

}
});
