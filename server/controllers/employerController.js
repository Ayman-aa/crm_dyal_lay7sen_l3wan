const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lead = require('../models/Lead');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const inProgressCount = await Lead.countDocuments({ 
      status: { $nin: ['COMPLETED', 'CANCELED'] } 
    });
    
    const completedCount = await Lead.countDocuments({ status: 'COMPLETED' });
    
    const canceledCount = await Lead.countDocuments({ status: 'CANCELED' });

    res.json({
      inProgressCount,
      completedCount,
      canceledCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all managers
exports.getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('-password');
    res.json(managers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create a new manager
exports.createManager = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if manager already exists
    let manager = await User.findOne({ email });
    if (manager) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new manager
    manager = new User({
      name,
      email,
      password,
      role: 'manager'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    manager.password = await bcrypt.hash(password, salt);

    await manager.save();
    res.json(manager);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update manager
exports.updateManager = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let manager = await User.findById(req.params.managerId);
    
    if (!manager) {
      return res.status(404).json({ msg: 'Manager not found' });
    }

    // Update fields
    if (name) manager.name = name;
    if (email) manager.email = email;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      manager.password = await bcrypt.hash(password, salt);
    }

    await manager.save();
    res.json(manager);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Manager not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Delete manager
exports.deleteManager = async (req, res) => {
  try {
    // Find and remove manager
    const manager = await User.findById(req.params.managerId);
    
    if (!manager) {
      return res.status(404).json({ msg: 'Manager not found' });
    }

    if (manager.role !== 'manager') {
      return res.status(400).json({ msg: 'User is not a manager' });
    }

    await manager.deleteOne();
    
    // Optional: Handle leads associated with this manager
    // This depends on your business logic
    
    res.json({ msg: 'Manager removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Manager not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get all leads with optional filtering
exports.getLeads = async (req, res) => {
  try {
    const { managerId, status } = req.query;
    const filter = {};
    
    // Apply filters if provided
    if (managerId) filter.manager = managerId;
    if (status) filter.status = status;
    
    const leads = await Lead.find(filter)
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Create a new lead
exports.createLead = async (req, res) => {
  const { contactName, contactEmail, companyName, status, managerId } = req.body;

  try {
    // Verify manager exists
    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(400).json({ msg: 'Invalid manager' });
    }

    const newLead = new Lead({
      contactName,
      contactEmail,
      companyName,
      status: status || 'PENDING',
      manager: managerId
    });

    const lead = await newLead.save();
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  const { contactName, contactEmail, companyName, status, managerId, notes } = req.body;

  try {
    let lead = await Lead.findById(req.params.leadId);
    
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // Update fields if provided
    if (contactName) lead.contactName = contactName;
    if (contactEmail) lead.contactEmail = contactEmail;
    if (companyName) lead.companyName = companyName;
    if (status) lead.status = status;
    if (notes) lead.notes = notes;
    
    // Update manager if provided
    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== 'manager') {
        return res.status(400).json({ msg: 'Invalid manager' });
      }
      lead.manager = managerId;
    }

    lead.updatedAt = Date.now();
    await lead.save();
    
    res.json(lead);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Delete lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    await lead.deleteOne();
    res.json({ msg: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Lead not found' });
    }
    res.status(500).send('Server Error');
  }
};