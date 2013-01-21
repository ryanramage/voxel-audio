# voxel-audio

Use positional audio in your [voxeljs.com](http://voxeljs.com) world.

demo [http://ryanramage.github.com/voxel-audio/](http://ryanramage.github.com/voxel-audio/)

**not done: work in progress**


## Quick Start

```
	var audio = require('voxel-audio');

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

```

## Reference

See the following urls for help with html5 positional audio:

 - [html5rocks tutorial](http://www.html5rocks.com/en/tutorials/webaudio/games/)
 - [w3 spec](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#PannerNode)



## License - MIT

Copyright (c) 2013 Ryan Ramage

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.