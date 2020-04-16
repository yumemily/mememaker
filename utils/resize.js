
var Jimp = require('jimp');
const path = require('path')
const pathToFile = path.join(__dirname, '../public/uploads')

const fs = require('fs');
//get images.json here
//path is in images.json

function resize (){ 
    fs.readdir(pathToFile, (err, files) => {
    files.forEach(file => {
        {
            resizeImage(file);
        }
    });
});
}
function resizeImage(fileName) {
    Jimp.read(pathToFile+'/'+fileName).then(function (image) {
        image
            .resize(300, Jimp.AUTO)
            .quality(60)
            .write(pathToFile+'/'+fileName)+'test';
    })
}


    module.exports = resize;