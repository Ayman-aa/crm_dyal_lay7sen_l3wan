const Lead = require('../models/Lead');

// Get leads assigned to the manager
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ manager: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update lead status or notes
exports.updateLeadStatus = async (req, res) => {
  const { status, notes } = req.body;
  
  try {
    let lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // Verify lead is assigned to current manager
    if (lead.manager.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this lead' });
    }

    // Update status if provided
    if (status) lead.status = status;
    
    // Add note if provided
    if (notes && notes.length > 0) {
      if (!Array.isArray(lead.notes)) {
        lead.notes = [];
      }
      
      if (Array.isArray(notes)) {
        lead.notes = [...lead.notes, ...notes];
      } else if (typeof notes === 'string') {
        lead.notes.push(notes);
      }
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