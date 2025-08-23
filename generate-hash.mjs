import crypto from 'crypto';

const password = 'admin123';
const salt = crypto.randomBytes(16).toString('hex');

crypto.scrypt(password, salt, 64, (err, derivedKey) => {
  if (err) throw err;
  const hash = salt + ':' + derivedKey.toString('hex');
  console.log('Generated hash for password "' + password + '":');
  console.log(hash);
});
