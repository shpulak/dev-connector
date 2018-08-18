const notFound = (errors, response) => {
  return response.status(404).json(errors);
};

const badRequest = (errors, response) => {
  return response.status(400).json(errors);
};

module.exports = {
  notFound,
  badRequest
};
