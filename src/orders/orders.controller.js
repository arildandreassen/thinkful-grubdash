const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const validDeliveryStatus = [
  "pending",
  "preparing",
  "out-for-delivery",
  "delivered",
];

const list = (req, res, next) => {
  res.json({ data: orders });
};

const create = (req, res, next) => {
  const { body } = res.locals;
  const newOrder = {
    ...body,
    id: nextId(),
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

const read = (req, res, next) => {
  const { order } = res.locals;
  res.json({ data: order });
};

const update = (req, res, next) => {
  const { order, body } = res.locals;
  const updatedOrder = {
    ...order,
    ...body,
  };
  updatedOrder.id = order.id;
  res.status(200).json({ data: updatedOrder });
};

const destroy = (req, res, next) => {
  const { index, order } = res.locals;
  orders.splice(index, 1);
  res.status(204).json({ data: order });
};

const validateExists = (req, res, next) => {
  const { orderId } = req.params;
  const order = orders.find((order) => order.id === orderId);
  const index = orders.findIndex((order) => order.id === orderId);

  if (order) {
    res.locals.order = order;
    res.locals.index = index;
    res.locals.orderId = orderId;
    return next();
  }

  return next({ status: 404, message: `Order ${orderId} not found` });
};

const validateBody = (req, res, next) => {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  if (!deliverTo || deliverTo === "") {
    return next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  } else if (!mobileNumber || mobileNumber === "") {
    return next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  } else if (!dishes) {
    return next({
      status: 400,
      message: "Order must include a dish",
    });
  } else if (!Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }

  for (const [index, dish] of dishes.entries()) {
    if (
      dish.quantity === undefined ||
      typeof dish.quantity !== "number" ||
      dish.quantity === 0
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  }

  res.locals.body = req.body.data;
  return next();
};

const validateUpdate = (req, res, next) => {
  const { data: { id, status } = {} } = req.body;
  const { orderId } = req.params;
  const { order } = res.locals;
  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
    });
  } else if (!validDeliveryStatus.includes(status)) {
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  } else if (order.status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  next();
};

const canBeDestroyed = (req, res, next) => {
  const { order } = res.locals;
  if (order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  next();
};

module.exports = {
  list,
  read: [validateExists, read],
  create: [validateBody, create],
  update: [validateExists, validateBody, validateUpdate, update],
  destroy: [validateExists, canBeDestroyed, destroy],
};
