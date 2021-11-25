function isValidOperation(body, columns) {
  const updates = Object.keys(body);
  return updates.every((update) => columns.includes(update));
}

function validateId(_id) {
  if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
    return false;
  }
  return true;
}

module.exports = {
  isValidOperation,
  validateId,
};
