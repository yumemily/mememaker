var express = require('express');
var router = express.Router();
const upload = require('../utils/upload')
var Jimp = require('jimp');
const fs = require('fs')
var bodyParser = require('body-parser')

const path = require('path')
const { loadData, saveData, loadMemesData, saveMemesData } = require('../utils/data')

var index = express();
index.use(express.json());
index.use(express.urlencoded({ extended: false }));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/browse', (req, res) => {
  const data = loadData()
  res.render('allimages', { images: data })
})

//Upload image
router.post('/upload', upload.single('fileUpload'), async (req, res, next) => {
  const { file } = req
  if (!file) {
    return res.render('allimages', { error: 'you need to upload a file' })
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
    image.resize(Jimp.AUTO, 200, Jimp.RESIZE_BEZIER);
    await image.writeAsync(file.path) //wait until promise is resolved, promise is something that arrives
    file.id = data.length === 0 ? 1 : data[data.length - 1].id + 1
    data.push(file)
    saveData(data)

  } catch (e) {
    fs.unlinkSync(file.path)
    return res.render('index', { error: e.message })
  }

  //Render allimages view template
  res.render('allImages', { images: data })
})

//Create meme
const pathToMemes = path.join(__dirname, '../public/memes')

router.post('/addtext', urlencodedParser, async (req, res, next) => {

  newFileName = Date.now()//unique, new file name

  console.log('HELLO', req.body) //bodyparser needed to read body

  const {topText, bottomText, id} = req.body //client can only send body using post/put/patch
  console.log('toptext',topText)

  if(!id)
  return res.redirect('/browse') //400 means something is missing in your request, res.direct doesn't allow you to use error
  if( !topText && !bottomText)
  return res.redirect('/browse')

  //Create Meme

  var loadedImage;

  // Use id to query the original image
  const data = loadData();
  const selectedImageIndex = data.findIndex(image => image.id*1 == id*1)
  if(selectedImageIndex === -1){
    return res.redirect('/browse')
  }
  const selectedImage = data[selectedImageIndex]
  let imagePath = selectedImage.path

  await Jimp.read(`${imagePath}`)
    .then(function (image) {
      loadedImage = image;
      return Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    })
    .then(function (font) {

      var w = loadedImage.bitmap.width;
      var h = loadedImage.bitmap.height;
      
      console.log('w,h', w, h)

      loadedImage.print(
        font, 0, 0,
        {
          text: req.body.topText,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        }, w, h,
      )
      loadedImage.print(
        font, 0, h - Jimp.measureTextHeight(font,req.body.topText),
        {
          text: req.body.bottomText,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        }, w, h
      )
        .write(`${pathToMemes}/${newFileName}`);
    })
    .catch(function (err) {
      console.error(err);
    });
  
    // Push image to the database
  const memeData = loadMemesData();
  memeData.push({ filename: newFileName })
  saveMemesData(memeData)

  res.render('allmemes', { images: memeData })
})

router.get('/memes', (req, res) => {
  const memeData = loadMemesData();
  console.log('why', memeData)
  res.render('allmemes', { images: memeData })
})

/* GET home page. */
router.get('/', function (req, res, next) {
  const memeData = loadMemesData();
  res.render('index', { title: 'Welcome to the Memerator', images: memeData });
});

module.exports = router;
