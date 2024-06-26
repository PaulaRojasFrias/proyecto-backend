const { faker } = require("@faker-js/faker");

const generateProduct = () => {
  return {
    id: faker.database.mongodbObjectId(),
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    department: faker.commerce.department(),
    stock: parseInt(faker.string.numeric()),
    description: faker.commerce.productDescription(),
    image: faker.image.url(),
  };
};

const generateProducts = () => {
  const products = [];
  for (let i = 0; i < 100; i++) {
    products.push(generateProduct());
  }
  return products;
};

module.exports = generateProducts;
