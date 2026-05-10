const express = require("express")
const { readInventory, writeInventory } = require("./utils/db")
const app = express()
const authRoutes = require("./routes/auth")
const authMiddleware = require("./middleware/authMiddleware")

app.use(express.json())
app.use('/api/auth', authRoutes)


app.get('/api/inventory',authMiddleware, (req, res) => {
  const db = readInventory()
  res.json(db.items)
})

app.post('/api/inventory', authMiddleware, (req, res) => {
  const item = req.body
  item.id = Date.now().toString()
  const currentInventory = readInventory()
  currentInventory.items.push(item)
  writeInventory(currentInventory)
  res.json(item)
})

app.put('/api/inventory/:id',authMiddleware, (req, res) => {
  const id = req.params.id
  const newData = req.body
  const db = readInventory()
  const index = db.items.findIndex(item => item.id === id)
  db.items[index] = { ...db.items[index], ...newData }
  writeInventory(db)
  res.json(newData)
})

app.delete('/api/inventory/:id',authMiddleware, (req, res) => {
  const id = req.params.id
  const db = readInventory()
  const newdata = db.items.filter(item => item.id !== id)
  db.items = newdata
  writeInventory(db)
  res.json({message  : " itemdeleted" })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})