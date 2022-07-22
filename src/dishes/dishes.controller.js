const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

const list = (req, res, next) => {
  res.json({ data: dishes });
};

const read = (req, res, next) => {
  const { dish } = res.locals;
  res.json({ data: dish });
};

const create = (req, res, next) => {
  const { body } = res.locals;
  const newDish = {
    ...body,
    id: nextId(),
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

const update = (req, res, next) => {
  const { dish, body } = res.locals;
  const updateDish = {
    ...dish,
    ...body,
  };
  updateDish.id = dish.id;
  res.status(200).json({ data: updateDish });
};

const validateExists = (req, res, next) => {
  const { dishId } = req.params;
  const dish = dishes.find((dish) => dish.id === dishId);
  if (dish) {
    res.locals.dish = dish;
    res.locals.dishId = dishId;
    return next();
  }

  next({ status: 404, message: `Dish does not exist: ${dishId}` });
};

const validateBody = (req, res, next) => {
  const { data: { name, description, price, image_url } = {} } = req.body;
  if (!name || name === "") {
    return next({ status: 400, message: "Dish must include a name" });
  } else if (!description || description === "") {
    return next({ status: 400, message: "Dish must include a description" });
  } else if (!price) {
    return next({ status: 400, message: "Dish must include a price" });
  } else if (typeof price !== "number" || price < 0) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer grater than 0",
    });
  } else if (!image_url || image_url === "") {
    return next({ status: 400, message: "Dish must include a image_url" });
  } else {
    res.locals.body = req.body.data;
    next();
  }
};

const validateMatch = (req, res, next) => {
  const { dishId, body } = res.locals;
  if (body.id && dishId !== body.id) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${body.id}, Route: ${dishId}`,
    });
  }
  next();
};

module.exports = {
  list,
  read: [validateExists, read],
  create: [validateBody, create],
  update: [validateExists, validateBody, validateMatch, update],
};
