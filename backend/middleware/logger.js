const morgan = require('morgan');

const isDev = process.env.NODE_ENV !== 'production';

morgan.token('body', (req) => {
  if (!req.body || Object.keys(req.body).length === 0) return '';
  const safe = { ...req.body };
  delete safe.password;
  delete safe.confirm;
  return JSON.stringify(safe);
});

const devFormat =
  ':method :url :status :response-time ms — :res[content-length] bytes :body';

const prodFormat =
  ':remote-addr :method :url :status :response-time ms :date[iso]';

const logger = morgan(isDev ? devFormat : prodFormat, {
  skip: (req, res) => res.statusCode < 400 && !isDev,
});

module.exports = logger;
