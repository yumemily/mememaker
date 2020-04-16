var express = require('express');
var router = express.Router();
const upload = require('../utils/upload')
var Jimp = require('jimp');
const fs = require('fs')
var bodyParser = require('body-parser')

const path = require('path')
const { loadData, saveData } = require('../utils/data')
const { loadMemesData, saveMemesData } = require('../utils/memesdata')

var index = express();
index.use(express.json());
index.use(express.urlencoded({ extended: false }));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/browse', (req, res) => {
  const data = loadData()
  res.render('allImages', { images: data })
})

//Upload image
router.post('/upload', upload.single('fileUpload'), async (req, res, next) => {
  const { file } = req
  if (!file) {
    return res.render('allImages', { error: 'you need to upload a file' })
  };
  const data = loadData()
  const found = data.findIndex(el => el.originalname === file.originalname && el.size === file.size)
  if (found !== -1) {
    return res.render('index', { error: 'No duplicate uploads allowed' })
  }

  //Resize image
  // console.log('filename', file.filename)
  // await Jimp.read(`${file.path}`)
  //   .then(filename => {
  //     return filename
  //       .resize(300, Jimp.AUTO) // resize
  //       .quality(60) // set JPEG quality
  //       .write(`${file.path}`); // save
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });

  //Resize Image
  try {
    let image = await Jimp.read(file.path)
    image.resize(300, Jimp.AUTO, Jimp.RESIZE_BEZIER);
    await image.writeAsync(file.path) //wait until promise is resolved, promise is something that arrives
    file.id = data.length === 0 ? 1 : data[data.length - 1].id + 1
    data.push(file)
    saveData(data)

  } catch (e) {
    fs.unlinkSync(file.path)
    return res.render('index', { error: e.message })
  }

  //Push image to the database
  // image.id = data.length === 0 ? 1 : data[data.length - 1].id + 1
  // data.push(image)
  // saveData(data)

  //Render allimages view template
  res.render('allImages', { images: data })
})

//Create meme
const pathToData = path.join(__dirname, '../public/uploads')
const pathToMemes = path.join(__dirname, '../public/memes')

router.post('/addtext/:img', urlencodedParser, async (req, res, next) => {
  splitUrl = req.path.split('/')
  fileName = splitUrl[2]
  console.log('HELLO',req.body) //bodyparser to read body

  //Add text over image
  console.log('create meme', req.path)
  // await Jimp.loadFont(`${pathToData}/${fileName}`)
  //   .then(font => {
  //     image.print(
  //       font,
  //       x,
  //       y,
  //       {
  //         text: 'Hello world!', //static for now
  //         alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
  //         alignmentY: Jimp.VERTICAL_ALIGN_TOP
  //       },
  //       maxWidth,
  //       maxHeight,

  //     )
  //   });

  var imageCaption = 'Image caption';
  var loadedImage;

  await Jimp.read(`${pathToData}/${fileName}`)
    .then(function (image) {
      loadedImage = image;
      return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    })
    .then(function (font) {
      loadedImage.print(font, 0, 0, req.body.topText, Jimp.HORIZONTAL_ALIGN_CENTER)
      .write(`${pathToMemes}/${fileName}`);
    })
    .catch(function (err) {
      console.error(err);
    });
  // Push image to the database

  const memeData = loadMemesData();
  memeData.push({filename: fileName})
  saveMemesData(memeData)

  res.render('allMemes', {images: memeData})
})

router.get('/memes', (req, res) => {
  const memeData = loadMemesData();
  console.log('why',memeData)
  res.render('allmemes', { images: memeData })
})

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
