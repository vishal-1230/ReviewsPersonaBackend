export const checkPro = (req, res, next) => {
    if (req.user.role === "PRO") {
        next();
    } else {
        res.status(401).json({ message: "Permission Not Allowed" });
    }
}