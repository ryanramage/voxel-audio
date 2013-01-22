/*
 * Thanks to the following sources of info
 * http://www.html5rocks.com/en/tutorials/webaudio/games/
 * https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#PannerNode
*/ 

var init = false,
    audioContext,
    game,
    audioDestination;


exports.initGameAudio = function(game_) {
	audioContext = new webkitAudioContext();
	audioDestination = audioContext.destination;
	// Then render the camera on tick
	game = game_;
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
};

exports.PositionAudio.prototype.createPanner = function() {
	var self = this;
	self.panner = audioContext.createPanner();

	var startingPosition = self.options.startingPosition;
	if (!startingPosition || startingPosition.length !== 3) throw new Error('startingPosition required option. format: [x,y,z]');

	self.panner.setPosition(startingPosition[0], startingPosition[1], startingPosition[2]);
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

	self.panner.connect(audioDestination);
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
	var position = game.camera.matrixWorld.getPosition();
	var velocity = game.controls.velocity.clone();

	audioContext.listener.setPosition(position.x, position.y, position.z);
	audioContext.listener.setVelocity(velocity.x, velocity.y, velocity.z);


	var m = game.camera.matrixWorld;
	// Multiply the orientation vector by the world matrix of the camera.
	var vec = m.multiplyVector3(new game.THREE.Vector3(0,0,1));
	var direction  = vec.subSelf(position).normalize();
	var vec2 = m.multiplyVector3(new game.THREE.Vector3(0,-1,0));
	var up_direction = vec2.subSelf(position).normalize();


	// Set the orientation and the up-vector for the listener.
	audioContext.listener.setOrientation(direction.x, direction.y, direction.z, up_direction.x, up_direction.y, up_direction.z);
}
