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

  const upload = multer({ storage , 
    limits: { fileSize: 5 * 1024 * 1024  },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  })

  function checkFileType(file, cb){
    const fileTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif'
    ]
    if(fileTypes.includes(file.mimetype)){
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  }

module.exports = upload




