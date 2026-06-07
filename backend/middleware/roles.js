// Role-checking middleware
module.exports = function(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!allowedRoles.length) return next();
    if (!allowedRoles.includes(user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
};
