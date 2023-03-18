const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({

    destination: './pubilc/files',

    filename: (req, file, cb) => {

        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);

    }

});


const upload = multer({
    storage: storage
});

let uploadMultiple = upload.fields([{ name: "document1", maxCount: 1 }, { name: "document2", maxCount: 1 }, { name: "document3", maxCount: 1 }]);




const storage1 = multer.diskStorage({

    destination: './pubilc/bank',

    filename: (req, file, cb) => {

        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);

    }

});


exports.upload1 = multer({
    storage: storage1
});

exports.uploadMultiple = uploadMultiple;


