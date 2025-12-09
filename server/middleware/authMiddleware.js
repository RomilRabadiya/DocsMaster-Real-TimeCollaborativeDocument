const jwt = require("jsonwebtoken");
const User = require("../models/user");

//Work of Middleware is to check whether the request has a valid token or not
//And if valid, attach the user to req.user for further use in controllers

// Middleware function
const protect = async (req, res, next) => {
  let token;

  // "Bearer" is a keyword used in Authorization headers when sending a JWT token
  // Check if request has Authorization Is done or not
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try
    {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token using JWT secret
      //Token Password is Match With our security key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //Find the user linked to this token and attach to req.user
      //-select("-password") means exclude password field from user data
      req.user = await User.findById(decoded.id).select("-password");

      //Call next() → move to controller
      next();
    }
    catch (error) {
      // If token is invalid or expired
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token at all
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
