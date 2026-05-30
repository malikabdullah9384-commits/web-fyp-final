const EMAIL_RE = /^\S+@\S+\.\S+$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

const validateLogin = (req, res, next) => {
  const email    = str(req.body.email);
  const password = str(req.body.password);

  if (!email)                      return res.status(400).json({ message: 'Email is required' });
  if (!EMAIL_RE.test(email))       return res.status(400).json({ message: 'Invalid email format' });
  if (!password)                   return res.status(400).json({ message: 'Password is required' });
  if (password.length < 6)        return res.status(400).json({ message: 'Password must be at least 6 characters' });

  req.body.email    = email;
  req.body.password = password;
  next();
};

const validateRegister = (req, res, next) => {
  const name     = str(req.body.name);
  const email    = str(req.body.email);
  const password = str(req.body.password);

  if (!name)                       return res.status(400).json({ message: 'Name is required' });
  if (name.length < 2)             return res.status(400).json({ message: 'Name must be at least 2 characters' });
  if (!email)                      return res.status(400).json({ message: 'Email is required' });
  if (!EMAIL_RE.test(email))       return res.status(400).json({ message: 'Invalid email format' });
  if (!password)                   return res.status(400).json({ message: 'Password is required' });
  if (password.length < 6)        return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (!/[A-Z]/.test(password))    return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
  if (!/[0-9]/.test(password))    return res.status(400).json({ message: 'Password must contain at least one number' });

  req.body.name     = name;
  req.body.email    = email;
  req.body.password = password;
  next();
};

const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  if (id && !/^[a-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};

const sanitizeStrings = (req, res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<[^>]*>/g, '').trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        clean(obj[key]);
      }
    }
  };
  clean(req.body);
  next();
};

module.exports = { validateLogin, validateRegister, validateObjectId, sanitizeStrings };
