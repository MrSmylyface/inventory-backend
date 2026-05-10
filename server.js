const express = require("express")
const { readInventory, writeInventory } = require("./utils/db")
const app = express()
const authRoutes = require("./routes/auth")
const authMiddleware = require("./middleware/authMiddleware")
const { specs, swaggerUi } = require('./swagger')

app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
app.use('/api/auth', authRoutes)


/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management
 *
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized
 */
app.get('/api/inventory',authMiddleware, (req, res) => {
  const db = readInventory()
  res.json(db.items)
})

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Add a new inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Created item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       401:
 *         description: Unauthorized
 */
app.post('/api/inventory', authMiddleware, (req, res) => {
  const item = req.body
  item.id = Date.now().toString()
  const currentInventory = readInventory()
  currentInventory.items.push(item)
  writeInventory(currentInventory)
  res.json(item)
})

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Item'
 *     responses:
 *       200:
 *         description: Updated item data
 *       401:
 *         description: Unauthorized
 */
app.put('/api/inventory/:id',authMiddleware, (req, res) => {
  const id = req.params.id
  const newData = req.body
  const db = readInventory()
  const index = db.items.findIndex(item => item.id === id)
  db.items[index] = { ...db.items[index], ...newData }
  writeInventory(db)
  res.json(newData)
})

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 *       401:
 *         description: Unauthorized
 */
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