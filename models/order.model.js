
"use strict";

const orders = [];

function createOrder(orderData) {
  const order = {
    id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    customer: {
      fullName: orderData.fullName,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      postalCode: orderData.postalCode,
    },
    items: orderData.items,
    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    total: orderData.total,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  orders.push(order);

  return order;
}

function findOrderById(orderId) {
  return orders.find((order) => order.id === orderId) || null;
}

function getAllOrders() {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}


function updateOrderStatus(orderId, newStatus) {
  const allowedStatuses = [
    "Pending",
    "Confirmed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    return { error: "Invalid order status." };
  }

  const order = findOrderById(orderId);

  if (!order) {
    return { error: "Order not found." };
  }

  order.status = newStatus;

  return { order };
}


module.exports = {
  createOrder,
  findOrderById,
  getAllOrders,
  updateOrderStatus,
};

