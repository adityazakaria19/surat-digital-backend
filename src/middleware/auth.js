import jwt from "jsonwebtoken";

export const authenticate = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    c.set("user", decoded);
    await next();
  } catch (err) {
    return c.json({ message: "Invalid token" }, 401);
  }
};

export const authorize = (...roles) => {
  return async (c, next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.role)) {
      return c.json({ message: "Forbidden" }, 403);
    }
    await next();
  };
};
