var fs = require('fs');

module.exports = function Uploadable(name, path) {
  this.name = name;
  this.path = path;
  this.stream = fs.createReadStream(path);
}
