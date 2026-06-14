// ─── Temporary mock ────────────────────────────────────────────────────────
// Replace the body of this function with member 1's real session check later.
// Example of what it will look like when done:
//
//   if (!req.session.user || req.session.user.role !== 'staff') {
//     return res.redirect('/login');
//   }
//   next();
//
// ───────────────────────────────────────────────────────────────────────────
module.exports = (req, res, next) => {
  next(); // TODO: replace with real auth check from member 1
};
