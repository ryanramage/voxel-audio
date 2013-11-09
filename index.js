/*
 * Thanks to the following sources of info
 * http://www.html5rocks.com/en/tutorials/webaudio/games/
 * https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#PannerNode
*/

var bresenham3d = require('bresenham3d'),
    init = false,
    calculateAbsorption  = false,
    audioInstances = [],
    defaultDensity = 1,
    densityMapping = [],
    densityGainMin = 0.005,
    audioContext,
    game,
    audioDestination;


exports.initGameAudio = function(game_, settings) {
	audioContext = new webkitAudioContext();
	audioDestination = audioContext.destination;
	game = game_;

	if (!settings) settings = {};
	if (settings.calculateAbsorption) calculateAbsorption = true;
	if (settings.defaultDensity) defaultDensity = settings.defaultDensity;
	if (settings.densityMapping) densityMapping = settings.densityMapping;
	if (settings.densityGainMin) densityGainMin = settings.densityGainMin;

	game.on('tick', tick);
	init = true;
};


exports.getAudioContext = function() {
	return audioContext;
};

exports.PositionAudio = function(options) {
	var self = this;

	if (!init) throw new Error('initGameAudio must be called first.');

	self.options = options;
	self.createPanner();
	// need one of source, buffer, or url
	if (options.url) self.initURL();
	if (options.buffer) self.initBuffer();
	if (options.source) self.initSource();
	if (options.name) self.name = options.name;

	// should add a distroy so not to leave things around....
	audioInstances.push(self);
};

exports.PositionAudio.prototype.createPanner = function() {
	var self = this;
	self.panner = audioContext.createPanner();
	self.gainNode   = audioContext.createGainNode();

	var startingPosition = self.options.startingPosition;
	if (!startingPosition || startingPosition.length !== 3) throw new Error('startingPosition required option. format: [x,y,z]');

	self.panner.setPosition(startingPosition[0], startingPosition[1], startingPosition[2]);
	self.position = {
		x: startingPosition[0],
		y: startingPosition[1],
		z: startingPosition[2]
	};
	self.panner.coneOuterGain = self.options.coneOuterGain || Number(0);
	self.panner.coneOuterAngle = self.options.coneOuterAngle || 360;
	self.panner.coneInnerAngle = self.options.coneInnerAngle || 350;
	self.panner.refDistance = self.options.refDistance || 0.8;
	self.panner.maxDistance = self.options.maxDistance || 200000;
	// use the built in settings, for the following
	if (self.options.distanceModel) self.panner.distanceModel = self.options.distanceModel;
	if (self.options.rolloffFactor) self.panner.rolloffFactor = self.options.rolloffFactor;
	if (self.options.panningModel) self.panner.panningModel = self.options.panningModel;
};

exports.PositionAudio.prototype.initURL = function() {
	var self = this;
	self.url = self.options.url;
	self.ready = false;
};

exports.PositionAudio.prototype.initBuffer = function() {
	var self = this;
	self.options.source = audioContext.createBufferSource();
	self.options.source.buffer = self.options.buffer;
	self.initSource();
};

exports.PositionAudio.prototype.initSource = function() {
	var self = this;
	self.source = self.options.source;
	self.source.loop   = self.options.loop || false;
	self.ready = true;
};


exports.PositionAudio.prototype.play = function() {
	var self = this;
	if (!self.ready) throw new Error('Audio not ready. Did you call load?');

	self.gainNode.connect(audioDestination);
	self.panner.connect(self.gainNode);
	self.source.connect(self.panner);
	if (self.source.noteOn) self.source.noteOn(0);
	self.isPlaying = true;
};


exports.PositionAudio.prototype.load = function(callback) {
	var self = this;
	var request = new XMLHttpRequest();
	request.open('GET', this.url, true);
	request.responseType = 'arraybuffer';

	// Decode asynchronously
	request.onload = function() {
		audioContext.decodeAudioData( request.response, function(buffer) {
			self.options.buffer = buffer;
			self.initBuffer();
			callback(null);
		}, function(err){callback(err);});
	};
	request.send();
};



function tick() {

	game.camera.updateMatrixWorld();
	var position = new game.THREE.Vector3().getPositionFromMatrix(game.camera.matrixWorld);
	var velocity = game.controls.velocity.clone();

	audioContext.listener.setPosition(position.x, position.y, position.z);
	audioContext.listener.setVelocity(velocity.x, velocity.y, velocity.z);


	var m = game.camera.matrixWorld;
	// Multiply the orientation vector by the world matrix of the camera.
	var vec = new game.THREE.Vector3(0,0,1);
  vec.applyMatrix3(m);
	var direction  = vec.sub(position).normalize();
	var vec2 = new game.THREE.Vector3(0,-1,0);
  vec.applyMatrix3(m);
	var up_direction = vec2.sub(position).normalize();


	// Set the orientation and the up-vector for the listener.
	audioContext.listener.setOrientation(direction.x, direction.y, direction.z, up_direction.x, up_direction.y, up_direction.z);


	if (!calculateAbsorption) return;
	audioInstances.forEach(function(audio){
		adjustDensityGain(audio, position);
	});
}

// calculate absorption of things in the way. this is using the Beer-Lambert Law
// see https://en.wikipedia.org/wiki/Beer%E2%80%93Lambert_law
function adjustDensityGain(audio, position) {
	var totalDistance = Math.sqrt( (Math.abs(audio.position.x - position.x))^2 + (Math.abs(audio.position.y - position.y))^2 + (Math.abs(audio.position.z - position.z))^2 );
	var memo = {
		audio: audio,
		position: position,
		totalDistance: totalDistance,
		count: 0,
		densitySum: 0,
		totalCount: 0
	};
	bresenham3d(audio.position, position, memo, calculatePointDensity, setDensityGain);

}

function calculatePointDensity(pos, memo) {
	memo.totalCount++;
	var block = game.getBlock(pos);
	if (block) {
		memo.count++;
		var density = densityMapping[block] || defaultDensity;
		var block_distance_from_listener = Math.sqrt( (Math.abs(pos.x - memo.position.x))^2 + (Math.abs(pos.y - memo.position.y))^2 + (Math.abs(pos.z - memo.position.z))^2 );
		var percent = block_distance_from_listener/memo.totalDistance;
		memo.densitySum+= (((1.4*percent)-0.5)^2 + 0.5); // a u shape
	}
}

function setDensityGain(memo) {
	var gain = 1;
	if (memo.count > 0) {
		var exp = -1 * (memo.densitySum/120);
		gain = Math.pow(10, exp);
		if (gain < densityGainMin) gain = 0;
		if (gain > 1) gain = 1;
	}
	memo.audio.gainNode.gain.value = gain;
}


