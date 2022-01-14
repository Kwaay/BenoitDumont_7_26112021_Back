const multer = require('multer');

// Sélection des extensions autorisées
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  // Indication de l'endroit où stocker les fichiers récuperés
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  // Format du nom de l'image
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    if (name.endsWith(`.  ${extension}`)) {
      callback(null, `${Date.now()}_${name}`);
    } else {
      callback(null, `${Date.now()}_${name}.${extension}`);
    }
  },
});

module.exports = multer({ storage }).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);
