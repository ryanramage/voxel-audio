/*
  arguments
  ---------
  
  - `from_position` - an object with x,y,z properties, eg {x: 23, y: -21, z: 49}
  - `to_position` - an object with x,y,z properties, eg {x: -32, y: 40, z: 49}
  - 'memo' - an object used to store values (see onPoint below). eg {count: 0}
  - `onPoint` - a function that is called for each integer point found on the path. function(pos, memo) {}
  - 'onComplete' - [optional] a function that is called when complete. function(memo) {}

*/
module.exports = function(from_position, to_position, memo, onPoint, onComplete) {
	var temp;

	// safty first kids
	var x0 = Math.floor(from_position.x);
	var y0 = Math.floor(from_position.y);
	var z0 = Math.floor(from_position.z);
	var x1 = Math.floor(to_position.x);
	var y1 = Math.floor(to_position.y);
	var z1 = Math.floor(to_position.z);

	//'steep' xy Line, make longest delta x plane
	var swap_xy = Math.abs(y1 - y0) > Math.abs(x1 - x0);
	if (swap_xy) {
		temp = x0; x0 = y0; y0 = temp; //swap(x0, y0);
		temp = x1; x1 = y1; y1 = temp; //swap(x1, y1);
	}
    //do same for xz
    var swap_xz = Math.abs(z1 - z0) > Math.abs(x1 - x0);
    if (swap_xz) {
        temp = x0; x0 = z0; z0 = temp;  //swap(x0, z0);
        temp = x1; x1 = z1; z1 = temp;  //swap(x1, z1);
    }

    //delta is Length in each plane
    var delta_x = Math.abs(x1 - x0);
    var delta_y = Math.abs(y1 - y0);
    var delta_z = Math.abs(z1 - z0);
    
    //drift controls when to step in 'shallow' planes
    //starting value keeps Line centred
    var drift_xy = (delta_x / 2);
    var drift_xz = (delta_x / 2);

    //direction of line
    var step_x = 1;
    if (x0 > x1) step_x = -1;
    var step_y = 1;
    if (y0 > y1) step_y = -1;
    var step_z = 1;
    if (z0 > z1) step_z = -1;


    //starting point
    var y = y0;
    var z = z0;

    var cx, cy, cz;

    //step through longest delta (which we have swapped to x)
    for (var x = x0; x !== x1; x += step_x) {
        
        //copy position
        cx = x;    cy = y;    cz = z;

        //unswap (in reverse)
        if (swap_xz) {
			temp = cx; cx = cz; cz = temp; //swap(cx, cz);
        }
        if (swap_xy) {
			temp = cx; cx = cy; cy = temp; //swap(cx, cy);
        }
        //passes through this point
        if (onPoint) onPoint({x: cx, y: cy, z: cz}, memo);
        
        
        //update progress in other planes
        drift_xy = drift_xy - delta_y;
        drift_xz = drift_xz - delta_z;

        //step in y plane
        if (drift_xy < 0) {
            y = y + step_y;
            drift_xy = drift_xy + delta_x;
        }
        
        //same in z
        if (drift_xz < 0) {
            z = z + step_z;
            drift_xz = drift_xz + delta_x;
        }
    }
    if (onComplete) onComplete(memo);


};

