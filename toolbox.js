//JS Toolbox v1

//returns a positive integer following a discrete uniform distribution between 0 and n-1
function rand(n) {
	return Math.floor(Math.random() * n);
}

//returns a positive integer following a discrete highpass distribution between 1 and n-1
function sqrt_rand(n) {
	return Math.floor(Math.sqrt(Math.random()) * (n-1)) + 1;
}

//returns an array of n elements to be used with as a parameter to smart_rand(), to keep track of the previous rolls
function init_rand(n) {
	let rand_array = [];
	let init_array = [];
	let ctr = 0;
	while (ctr < n) {
		init_array.push(ctr);
		ctr ++;
	}
	while (init_array.length > 0) {
		ctr = rand(init_array.length);
		rand_array.push(init_array[ctr]);
		init_array.splice(ctr, 1);
	}
	return rand_array;
}

//returns a random value between 0 and n-1 (the parameter n given to the init_ran() which outputed the rand_array used here)
//a value that has been recently outputed has less chance of being outputed than a value that has been outputed a long time ago
//the order is still random and does not repeat
function smart_rand(rand_array) {
	if (rand_array.length == 1) return 0;
	let i = sqrt_rand(rand_array.length);
	let n = rand_array[i];
	rand_array.splice(i, 1);
	rand_array.unshift(n);
	return n;
}

//just a shorthand
function gID(id) {
	return document.getElementById(id);
}

//calling this function will automatically download a text file
function download_txt(filename, txt) {
	let element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + txt);
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

//converts given raw base64 data into a js arraybuffer object (an array of bytes so to speak)
function base64ToArrayBuffer(base64) {
	let binary_string = window.atob(base64);
	let len = binary_string.length;
	let bytes = new Uint8Array(len);
	let i = 0;
	while (i < len) {
		bytes[i] = binary_string.charCodeAt(i);
		i ++;
	}
	return bytes.buffer;
}

//multi-element load handling
//this tool allows for calling a single callback function once many asynchronous processes have ended

//increment this variable before starting an asynchronous process, it represents the exact amount of processes
let to_load = 0;

//overwrite this callback function before starting an asynchronous process, it will be called once all processes have ended
let load_hdl_f = ()=>{};

//this function must be given as the callback of the individual asynchronous processes
function load_handler() {
	if (to_load > 0) to_load --;
	if (to_load == 0) {
		load_hdl_f.call();//may increment "to_load"
		if (to_load == 0) load_hdl_f = ()=>{};
	}
}
