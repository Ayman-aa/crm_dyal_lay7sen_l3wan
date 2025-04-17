module.exports = function(req, res, next) {
    // Check if user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({ msg: 'Access denied: Employer role required' });
    }
    next();
  };