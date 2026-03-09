// backend/middleware/validate.js
module.exports = {
  validateRegister(req, res, next) {
    const { username, password } = req.body;
    if (!username || typeof username !== 'string' || username.length < 3)
      return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    if (!password || typeof password !== 'string' || password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    next();
  },
  validateLogin(req, res, next) {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required.' });
    next();
  },
  validateMessage(req, res, next) {
    const { receiver_id, encrypted_message } = req.body;
    if (!receiver_id || !encrypted_message)
      return res.status(400).json({ error: 'receiver_id and encrypted_message required.' });
    next();
  },
};
