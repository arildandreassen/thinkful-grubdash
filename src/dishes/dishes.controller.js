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
  const { dish } = res.locals;
  const newDish = {
    ...dish,
    id: nextId(),
  };
  dishes.push(newDish);
  res.status(200).json({ data: newDish });
};

const update = (req, res, next) => {
  const { dish } = res.locals;
  res.status(200).json({ data: dish });
};

const validateExists = (req, res, next) => {
  const { dishId } = req.params;
  const dish = dishes.find((dish) => dish.id === dishId);

  if (dish) {
    res.locals.dish = dish;
    res.locals.dishId = dishId;
    return next();
  }

  return next({ status: 404, message: `Dish does not exist: ${dishId}` });
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
    res.locals.dish = req.body.data;
    return next();
  }
};

const validateMatch = (req, res, next) => {
  const { dishId, dish } = res.locals;
  if (dishId !== dish.id) {
    return next({
      status: 404,
      message: `Dish id does not match route id. Dish: ${dish.id}, Route: ${dishId}`,
    });
  }

  return next();
};

module.exports = {
  list,
  read: [validateExists, read],
  create: [validateBody, create],
  update: [validateExists, validateBody, validateMatch, update],
};
