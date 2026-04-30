import jwt from "jsonwebtoken";

/**
 * authMiddleware
 * Protects routes by verifying the JWT token sent in the Authorization header.
 * Usage: add `authMiddleware` to any route you want to lock down.
 *   e.g. router.post("/listings", authMiddleware, createListing)
 *        router.delete("/listings/:id", authMiddleware, deleteListing)
 */
const authMiddleware = (req, res, next) => {
  // Expect: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Access denied." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded user payload to req so route handlers can access it
    // e.g. req.user.id, req.user.email
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Access denied." });
  }
};

export default authMiddleware;