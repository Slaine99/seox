const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    req.user = decoded;
    
    // Add ownerId to the request if user is a team member
    if (decoded.isTeamMember && decoded.ownerId) {
      req.ownerId = decoded.ownerId;
    }
    
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;