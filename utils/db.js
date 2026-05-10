const fs = require('fs')
function readInventory() {
  const data = fs.readFileSync('db/inventory.json', 'utf-8')
  const parsed = JSON.parse(data)
  return parsed
}
function writeInventory(data) {
  const string = JSON.stringify(data)
  fs.writeFileSync('db/inventory.json', string)
}
function readUser() {
  const data = fs.readFileSync('db/users.json', 'utf-8')
  const parsed = JSON.parse(data)
  return parsed
}
function writeUser(data) {
  const string = JSON.stringify(data)
  fs.writeFileSync('db/users.json', string)
}
module.exports = { readInventory, writeInventory, readUser, writeUser }