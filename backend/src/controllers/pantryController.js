const { PantryItem, User } = require('../models');

// Helper to build populate options
const getPopulateOptions = (populate) => {
  if (!populate) return [];
  
  const populateFields = populate.split(',');
  return populateFields.map(field => {
    if (field === 'owner') {
      return { path: 'owner', select: 'firstName lastName email imageUrl clerkId' };
    }
    return field;
  });
};

// @desc    Get all pantry items
// @route   GET /api/pantry-items
// @access  Public
exports.getPantryItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      sort = '-createdAt',
      populate,
      owner,
      clerkId
    } = req.query;
    
    // Build filter
    const filter = {};
    
    // If clerkId is provided, find the user first
    if (clerkId) {
      const user = await User.findOne({ clerkId });
      if (user) {
        filter.owner = user._id;
      } else {
        // No user found, return empty array
        return res.json({
          data: [],
          meta: {
            pagination: {
              page: 1,
              pageSize: parseInt(limit),
              pageCount: 0,
              total: 0
            }
          }
        });
      }
    } else if (owner) {
      filter.owner = owner;
    }
    
    let query = PantryItem.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Apply population
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach(opt => {
      query = query.populate(opt);
    });
    
    const items = await query;
    const total = await PantryItem.countDocuments(filter);
    
    res.json({
      data: items,
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

// @desc    Get single pantry item
// @route   GET /api/pantry-items/:id
// @access  Public
exports.getPantryItem = async (req, res) => {
  try {
    const { populate } = req.query;
    
    let query = PantryItem.findById(req.params.id);
    
    const populateOptions = getPopulateOptions(populate);
    populateOptions.forEach(opt => {
      query = query.populate(opt);
    });
    
    const item = await query;
    
    if (!item) {
      return res.status(404).json({ error: { message: 'Pantry item not found' } });
    }
    
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};

// @desc    Create pantry item
// @route   POST /api/pantry-items
// @access  Public
exports.createPantryItem = async (req, res) => {
  try {
    const itemData = { ...req.body };
    
    // If owner is provided as clerkId, find the user
    if (itemData.owner && typeof itemData.owner === 'string' && !itemData.owner.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ clerkId: itemData.owner });
      if (user) {
        itemData.owner = user._id;
      } else {
        return res.status(400).json({ error: { message: 'User not found' } });
      }
    }
    
    const item = await PantryItem.create(itemData);
    
    // Populate owner before returning
    await item.populate('owner', 'firstName lastName email imageUrl clerkId');
    
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// @desc    Create multiple pantry items
// @route   POST /api/pantry-items/bulk
// @access  Public
exports.createPantryItemsBulk = async (req, res) => {
  try {
    const { items, owner } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: { message: 'Items array is required' } });
    }
    
    let ownerId = owner;
    
    // If owner is provided as clerkId, find the user
    if (owner && typeof owner === 'string' && !owner.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await User.findOne({ clerkId: owner });
      if (user) {
        ownerId = user._id;
      } else {
        return res.status(400).json({ error: { message: 'User not found' } });
      }
    }
    
    const itemsToCreate = items.map(item => ({
      ...item,
      owner: ownerId
    }));
    
    const createdItems = await PantryItem.insertMany(itemsToCreate);
    
    res.status(201).json({ data: createdItems });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// @desc    Update pantry item
// @route   PUT /api/pantry-items/:id
// @access  Public
exports.updatePantryItem = async (req, res) => {
  try {
    const item = await PantryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email imageUrl clerkId');
    
    if (!item) {
      return res.status(404).json({ error: { message: 'Pantry item not found' } });
    }
    
    res.json({ data: item });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
};

// @desc    Delete pantry item
// @route   DELETE /api/pantry-items/:id
// @access  Public
exports.deletePantryItem = async (req, res) => {
  try {
    const item = await PantryItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: { message: 'Pantry item not found' } });
    }
    
    res.json({ data: { id: req.params.id } });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
};
