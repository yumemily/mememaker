//Middleware

const multer = require('multer') //import multer
const path = require('path')

const pathToUpload = path.join(__dirname, '../public/uploads')
console.log(pathToUpload,'===========')

//Disk storage engine gives you full control on storing files to disk
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pathToUpload) //if first arg is null, itll call next() behind the scenes and pass pathToUpload to request object; if there is an error (not null), it will not call next
    },
    filename: function (req, file, cb) {
        console.log(file)
        const allows = ['image/gif', 'image/jpeg', 'image/png', 'image/jpg']
        if (!allows.includes(file.mimetype)) {
            const error = new Error('file type not allowed')
            cb(error, undefined)
        }
        // if already exists in json server, throw errror
        cb(null, file.originalname)
    }

})

var upload = multer({ storage: storage })

module.exports = upload;