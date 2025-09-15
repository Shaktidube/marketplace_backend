const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      const Suffix = Date.now() 
      cb(null, Suffix +'_'+ file.originalname)
    }
  })

  const upload = multer({ storage })

module.exports = upload




