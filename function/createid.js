module.exports = function createId(length, prefix = "") {
  // Ensures the ID is at least the requested length (excluding prefix)
  let id = "";
  while (id.length < length) {
    id += Math.random().toString(36).substring(2);
  }
  id = id.substring(0, length);
  return prefix + id;
};
