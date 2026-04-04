const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');

// GET /api/users - Get all users
router.get('/', userController.getUsers);

// GET /api/users/clerk/:clerkId - Get user by Clerk ID
router.get('/clerk/:clerkId', userController.getUserByClerkId);

// GET /api/users/:id - Get single user
router.get('/:id', userController.getUser);

// POST /api/users - Create user
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/clerk/:clerkId - Delete user by Clerk ID (for webhooks)
router.delete('/clerk/:clerkId', userController.deleteUserByClerkId);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
