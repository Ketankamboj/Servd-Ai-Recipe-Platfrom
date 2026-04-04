const { User, Recipe, PantryItem, SavedRecipe } = require('../models');

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 25, sort = '-createdAt' } = req.query;
    
    const users = await User.find()
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments();
    
    res.json({
      data: users,
      meta: {
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(limit),
          pageCount: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Get user by Clerk ID
// @route   GET /api/users/clerk/:clerkId
// @access  Public
exports.getUserByClerkId = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res) => {
  try {
    const { clerkId, email, username, firstName, lastName, imageUrl, subscriptionTier } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ clerkId });
    
    if (user) {
      // Update existing user
      user = await User.findOneAndUpdate(
        { clerkId },
        { email, username, firstName, lastName, imageUrl, subscriptionTier },
        { new: true }
      );
      return res.json({ data: user });
    }
    
    // Create new user
    user = await User.create({
      clerkId,
      email,
      username,
      firstName,
      lastName,
      imageUrl,
      subscriptionTier: subscriptionTier || 'free'
    });
    
    res.status(201).json({ data: user });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    res.json({ data: user });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    // Cascade delete all related data
    await Promise.all([
      // Delete all pantry items owned by this user
      PantryItem.deleteMany({ owner: user._id }),
      // Delete all saved recipes by this user
      SavedRecipe.deleteMany({ user: user._id }),
      // Delete all recipes authored by this user
      Recipe.deleteMany({ author: user._id }),
    ]);
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    console.log(`User ${user._id} and all related data deleted`);
    
    res.json({ data: { id: req.params.id, message: 'User and all related data deleted' } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Delete user by Clerk ID (for webhook)
// @route   DELETE /api/users/clerk/:clerkId
// @access  Public
exports.deleteUserByClerkId = async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    
    // Cascade delete all related data
    const deleteResults = await Promise.all([
      // Delete all pantry items owned by this user
      PantryItem.deleteMany({ owner: user._id }),
      // Delete all saved recipes by this user
      SavedRecipe.deleteMany({ user: user._id }),
      // Delete all recipes authored by this user
      Recipe.deleteMany({ author: user._id }),
    ]);
    
    console.log(`Deleted related data for user ${user._id}:`, {
      pantryItems: deleteResults[0].deletedCount,
      savedRecipes: deleteResults[1].deletedCount,
      recipes: deleteResults[2].deletedCount,
    });
    
    // Delete the user
    await User.findByIdAndDelete(user._id);
    
    console.log(`User ${user.clerkId} deleted successfully`);
    
    res.json({ 
      data: { 
        id: user._id, 
        clerkId: req.params.clerkId,
        message: 'User and all related data deleted',
        deleted: {
          pantryItems: deleteResults[0].deletedCount,
          savedRecipes: deleteResults[1].deletedCount,
          recipes: deleteResults[2].deletedCount,
        }
      } 
    });
  } catch (error) {
    console.error('Error deleting user by clerkId:', error);
    res.status(500).json({ error: { message: error.message } });
  }
};
