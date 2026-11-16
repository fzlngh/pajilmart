const multer = require('multer');

// Simpan file sementara di memori lalu di-upload ke Supabase Storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Format gambar harus JPG, PNG, atau WEBP'));
    }
    cb(null, true);
  },
});

module.exports = upload;
