# bresenham3d

The Bresenham line algorithm is an algorithm which determines which order to form a close approximation to a straight line between two given points. This module is for points in a 3d space.


## Usage

`npm install bresenham3d`

```
var bresenham3d = require('bresenham3d'),
    p1 = {x:23, y:43, z: -32},
    p2 = {x: -3, y: 30.323, z: 0.32}
    density = 1.2,
    memo = {totalDensity: 0},
    pointDensity = function(pos, memo) {     
    	if (isBlock(pos)) memo.totalDensity += density;
	},
	xrayDamage = function(memo) {
		if (memo.totalDensity < 10) player.takeDamage(100);
    };

bresenham3d(p1,p2,memo, pointDensity, xrayDamage);

```


Reference
---------

 - [On Wikipedia](https://en.wikipedia.org/wiki/Bresenham's_line_algorithm)
 - [Shamlessly Borrowed From Here](http://cobrabytes.squeakyduck.co.uk/forum/index.php?topic=1150.0)

Use positional audio in your [voxeljs.com](http://voxeljs.com) world.

demo [http://ryanramage.github.com/voxel-audio/](http://ryanramage.github.com/voxel-audio/)

**not done: work in progress**



## License - MIT

Copyright (c) 2013 Ryan Ramage

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.