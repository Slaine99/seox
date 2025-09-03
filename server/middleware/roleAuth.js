// Role-based authentication middleware
const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user found" });
      }

      const userRole = req.user.role || "Viewing";
      
      // Log role information for debugging
      console.log(`Role check: User role ${userRole}, Allowed roles:`, allowedRoles);
      
      // Check if user's role is in the allowed roles
      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        return res.status(403).json({ 
          message: "Forbidden: You don't have permission to access this resource"
        });
      }
    } catch (error) {
      console.error("Role auth error:", error);
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

module.exports = roleAuth;