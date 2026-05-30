const bcrypt = require('bcryptjs');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

const verifyPassword = (plain, hashed) => bcrypt.compare(plain, hashed);

const isHashed = (str) => typeof str === 'string' && /^\$2[aby]\$\d{2}\$/.test(str);

module.exports = { hashPassword, verifyPassword, isHashed, SALT_ROUNDS };
