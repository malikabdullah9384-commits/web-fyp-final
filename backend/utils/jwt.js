const jwt = require('jsonwebtoken');

const ACCESS_EXPIRY  = process.env.JWT_EXPIRES_IN  || '1d';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const SECRET         = () => process.env.JWT_SECRET;
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';

const generateToken = (payload, expiresIn = ACCESS_EXPIRY) =>
  jwt.sign(payload, SECRET(), { expiresIn });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRY });

const verifyToken = (token) =>
  jwt.verify(token, SECRET());

const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET());

const decodeToken = (token) =>
  jwt.decode(token, { complete: true });

const generateAccessToken = (user) =>
  generateToken({ id: user._id, role: user.role });

const generateTokenPair = (user) => ({
  accessToken:  generateAccessToken(user),
  refreshToken: generateRefreshToken({ id: user._id, role: user.role }),
});

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  generateAccessToken,
  generateTokenPair,
  ACCESS_EXPIRY,
  REFRESH_EXPIRY,
};
