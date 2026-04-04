const express = require('express');
const router = express.Router();
const { pantryController } = require('../controllers');

// GET /api/pantry-items - Get all pantry items
router.get('/', pantryController.getPantryItems);

// GET /api/pantry-items/:id - Get single pantry item
router.get('/:id', pantryController.getPantryItem);

// POST /api/pantry-items - Create pantry item
router.post('/', pantryController.createPantryItem);

// POST /api/pantry-items/bulk - Create multiple pantry items
router.post('/bulk', pantryController.createPantryItemsBulk);

// PUT /api/pantry-items/:id - Update pantry item
router.put('/:id', pantryController.updatePantryItem);

// DELETE /api/pantry-items/:id - Delete pantry item
router.delete('/:id', pantryController.deletePantryItem);

module.exports = router;
