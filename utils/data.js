const fs = require('fs') //you need to import fs

const path = require('path');

const pathToData = path.join(__dirname, '../images.json')

function loadData(){
    const buffer = fs.readFileSync(pathToData);
    const data = buffer.toString();
    console.log(data)
    return JSON.parse(data)
}

function saveData(data){
    fs.writeFileSync(pathToData, JSON.stringify(data));
}

const pathToMemes = path.join(__dirname, '../memes.json')

function loadMemesData(){
    const buffer = fs.readFileSync(pathToMemes);
    const data = buffer.toString();
    console.log(data)
    return JSON.parse(data)
}

function saveMemesData(data){
    fs.writeFileSync(pathToMemes, JSON.stringify(data));
}

module.exports = {loadData, saveData, loadMemesData, saveMemesData}
