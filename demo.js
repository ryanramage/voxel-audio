var createGame = require('./lib/game')
var THREE = require('three')
var voxel = require('voxel')
var toolbar = require('toolbar')
var blockSelector = toolbar({el: '#tools'})
var skin = require('minecraft-skin')
var audio = require('voxel-audio')

window.game = createGame({
  generate: voxel.generator['Valley'],
  texturePath: './textures/',
  materials: [['grass', 'dirt', 'grass_dirt'], 'brick', 'dirt', 'obsidian', 'crate'],
  cubeSize: 25,
  chunkSize: 32,
  chunkDistance: 2,
  startingPosition: [35, 1024, 35],
  worldOrigin: [0,0,0],
  controlOptions: {jump: 6}
})

var viking = skin(game.THREE, 'viking.png').createPlayerObject()
viking.position.y = 60
game.scene.add(viking)

// this must be done first, before any other audio stuff
audio.initGameAudio(game);

// example of a very focused sound. Narrow cone angles
var laugh = new audio.PositionAudio({
  url : './132816__nanakisan__evil-laugh-19.mp3',
  startingPosition: [0, 93, 0],
  coneOuterAngle : 100,
  coneInnerAngle : 20,
  refDistance : 1.2,
  loop: true
});
// since we specified a url, we must load async load it, callback on ready
laugh.load(function(err){
  // start the sound playing
  laugh.play();
});

// example of a more ambient sound
var pickSound = new audio.PositionAudio({
  url : './71822__benboncan__mandrill-striking-rock.mp3',
  startingPosition: [0, 93, 0],
  coneOuterAngle : 360,
  coneInnerAngle : 360,
  refDistance : 2.0,
  loop: true  
});
pickSound.load(function(err){
  pickSound.play();
})



// example of a more ambient sound
game.createBlock({x: 5, y: 541, z: -857}, 4);

var music = new audio.PositionAudio({
  url : './Miaow-07-Bubble.m4a',
  startingPosition: [9, 516, -837],
  coneOuterAngle : 360,
  coneInnerAngle : 360,
  rolloffFactor: .4,
  refDistance : 5,
  loop: true  
});
music.load(function(err){
  music.play();
})



setInterval(function(){
  var position = game.controls.yawObject.position.clone();
  console.log(position);
}, 4000);


var currentMaterial = 1

blockSelector.on('select', function(material) {
  var idx = game.materials.indexOf(material)
  if(idx === -1) {
    for(var m = 0; m < game.materials.length; m++) {
      if(typeof game.materials[m] === 'object' && game.materials[m][0] === material) idx = m
    }
  }
  if (idx > -1) currentMaterial = idx + 1
})

game.on('collision', function (item) {
  incrementBlockTally()
  game.removeItem(item)
})

function createDebris (pos, value) {
  var mesh = new THREE.Mesh(
    new THREE.CubeGeometry(4, 4, 4),
    game.material
  )
  mesh.geometry.faces.forEach(function (face) {
    face.materialIndex = value - 1
  })
  mesh.translateX(pos.x)
  mesh.translateY(pos.y)
  mesh.translateZ(pos.z)
  
  return {
    mesh: mesh,
    size: 4,
    collisionRadius: 22,
    value: value
  }
}

function explode (pos, value) {
  if (!value) return
  var item = createDebris(pos, value)
  item.velocity = {
    x: (Math.random() * 2 - 1) * 0.05,
    y: (Math.random() * 2 - 1) * 0.05,
    z: (Math.random() * 2 - 1) * 0.05,
  }
  game.addItem(item)
  setTimeout(function (item) {
    game.removeItem(item)
  }, 15 * 1000 + Math.random() * 15 * 1000, item)
}

game.appendTo('#container')

var tally = document.querySelector('.tally .count')
function incrementBlockTally() {
  var c = +tally.innerText
  ++c
  tally.innerText = c
}

game.on('mousedown', function (pos) {
  var cid = game.voxels.chunkAtPosition(pos)
  var vid = game.voxels.voxelAtPosition(pos)
  if (erase) {
    explode(pos, game.getBlock(pos))
    game.setBlock(pos, 0)
  } else {
    game.createBlock(pos, currentMaterial)
  }
})

var erase = true
window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'X'.charCodeAt(0)) {
    erase = !erase
  }
})

function ctrlToggle (ev) { erase = !ev.ctrlKey }
window.addEventListener('keyup', ctrlToggle)
window.addEventListener('keydown', ctrlToggle)

var container = document.querySelector('#container')
container.addEventListener('click', function() {
  game.requestPointerLock(container)
})
