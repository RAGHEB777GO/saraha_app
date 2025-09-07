import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing" });

    const secret = process.env.JWT_SECRET || "secretKey123";
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid or expired token" });

      req.user = decoded;
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: "Auth middleware error", error: err.message });
  }
};
