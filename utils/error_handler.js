const notFound = (errors, response) => {
  return response.status(404).json(errors);
};

const badRequest = (errors, response) => {
  return response.status(400).json(errors);
};

const unauthorizedRequest = (errors, response) => {
  return response.status(401).json(errors);
};

module.exports = {
  notFound,
  badRequest,
  unauthorizedRequest
};
