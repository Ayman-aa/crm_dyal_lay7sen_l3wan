module.exports = function(req, res, next) {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Access denied: Manager role required' });
    }
    next();
  };