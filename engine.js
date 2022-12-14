let c = document.getElementById('c');
let ui_ctx = c.getContext('2d');

const json_file_version = 1;

const interval_t = 0.1;//hitsound update speed (in seconds)

let hitsound_merger, interval, vid_on_display, img_on_display, current_hm_beat, current_hm_cut, current_hm_loop, last_loop_t, round_duration;
let phase_shift = 0;//(only used for editing)

let audio_ctx = new AudioContext();
audio_ctx.suspend();
let music_gain = audio_ctx.createGain();
music_gain.connect(audio_ctx.destination);
let hitsound_gain = audio_ctx.createGain();
hitsound_gain.connect(audio_ctx.destination);

let img_elements = [];
let video_enabled = false;
let ui_enabled = true;

let round = {
	music: undefined,
	hitsound: undefined,
	beatmap: undefined,
	video: [],
	skin: {}
};

let cuts_rand;//for the smart random

function toggle_settings() {
	let settings_elm = gID('settings');
	if (settings_elm.style.display == 'block') {
		settings_elm.style.display = 'none';
	} else {
		settings_elm.style.display = 'block';
	}
}

function toggle_cursor() {
	let video_elm = gID('c');
	if (video_elm.style.cursor == 'default') {
		video_elm.style.cursor = 'none';
	} else {
		video_elm.style.cursor = 'default';
	}
}

function toggle_fullscreen() {
	if (document.fullscreenElement != null) {
		document.exitFullscreen();
	} else {
		document.documentElement.requestFullscreen();
	}
}

function toggle_ui() {
	ui_enabled = !ui_enabled;
}

document.addEventListener('keydown', (event)=>{
	if (event.code == "F8") toggle_settings();
	if (event.code == "F9") toggle_cursor();
}, false);

c.addEventListener('mousedown', (event)=>{
	toggle_settings();
}, false);

function get_settings() {
	let settings = {
		metadata: {
			version: json_file_version,
			type: 'settings',
		},
		data: {
			beatbar_position: gID('r_bbps').value,
			beatbar_length: gID('r_bblh').value,
			t0_position: gID('r_bb0p').value,
			music_volume: gID('r_mvol').value,
			hitsound_volume: gID('r_hvol').value,
			time_offset: gID('r_tfst').value
		}
	}
	return download_txt('settings.json', JSON.stringify(settings));
}

function set_settings(settings) {
	gID('r_bbps').value = settings.data.beatbar_position;
	gID('r_bblh').value = settings.data.beatbar_length;
	gID('r_bb0p').value = settings.data.t0_position;
	gID('r_mvol').value = settings.data.music_volume;
	gID('r_hvol').value = settings.data.hitsound_volume;
	gID('r_tfst').value = settings.data.time_offse;
}

function load_settings() {
	let reader = new FileReader();
	let files = gID('settings_input').files;
	reader.onload = (event)=>{
		let data;
		try {
			data = JSON.parse(reader.result);
		} catch (e) {
			console.log('asset reading error:\n'+e);
		}
		if (data.metadata.type == 'settings') parse_obj(data);
	};
	if (files.length > 0) reader.readAsText(files[0]);
}

function play_hitsound(t) {
	let hs = audio_ctx.createBufferSource();
	hs.buffer = round.hitsound;
	hs.connect(hitsound_merger);
	if (t == undefined) t = 0;
	//console.log((t-audio_ctx.currentTime)*1000);
	hs.start(t + gID('r_tfst').value/1000);
}

function display_img(id) {
	if (id == img_on_display) return;
	if (img_on_display != undefined) {
		img_elements[vid_on_display][img_on_display].style.visibility = 'hidden';
	}
	img_elements[vid_on_display][id].style.visibility = 'visible';
	img_on_display = id;
}

function draw_clear() {
	c.width = c.clientWidth;
	c.height = c.clientHeight;
}

function draw_beat(posx, posy) {
	if (posx>round.skin.range[0] && posx<c.width+round.skin.range[1]) {
		ui_ctx.drawImage(round.skin.beat.img, Math.floor(posx), Math.floor(posy));
	}
}

function parse_skin_coordinates(coord) {
	if (coord[0] == 'left') {
		return coord[1];
	}
	if (coord[0] == 'right') {
		return c.width + coord[1];
	}
	if (coord[0] == 'range') {
		return Math.max(round.skin.range[0], Math.min(c.width*gID('r_bb0p').value, c.width+round.skin.range[1])) + coord[1];
	}
	if (coord[0] == 'progress') {
		return (c.width+round.skin.progress_range[1]-round.skin.progress_range[0]) * Math.min(audio_ctx.currentTime/round_duration, 1) + round.skin.progress_range[0] + coord[1];
	}
	return 0;
}

function draw_img_stretch(layer, id) {
	let skin_elm, posx, posy;
	if (layer == 'back') {
		skin_elm = round.skin.back[id];
	} else if (layer == 'front') {
		skin_elm = round.skin.front[id];
	} else return;
	posy = (c.height - round.skin.height) * gID('r_bbps').value + skin_elm.top;
	posx = parse_skin_coordinates(skin_elm.left);
	if (skin_elm.right[0] == 'auto') {
		ui_ctx.drawImage(skin_elm.img, posx, posy);
	} else {
		ui_ctx.drawImage(skin_elm.img, posx, posy, parse_skin_coordinates(skin_elm.right)-posx, skin_elm.img.height);
	}
}

function draw_img_repeat() {
	//
}

function draw_layer(layer) {
	let cnt = 0;
	while (cnt < round.skin[layer].length) {
		draw_img_stretch(layer, cnt);
		cnt ++;
	}
}

function load_video(index) {
	let cnt = 0;
	let img;
	let vid = img_elements.length;
	img_elements.push([]);
	let fragment = document.createDocumentFragment();
	while (cnt < round.video[index].data.length) {
		img = new Image();
		img.onload = load_handler;
		img.src = round.video[index].data[cnt];
		img.style = 'position: absolute; width: 100vw; height: 100vh; object-fit: contain; visibility: hidden;';
		fragment.appendChild(img);
		img_elements[vid].push(img);
		cnt ++;
	}
	gID('video').appendChild(fragment);
}

function unload_video() {
	let elements = img_elements.shift();
	let cnt = 0;
	while (cnt < elements.length) {
		gID('video').removeChild(elements[cnt]);
		cnt ++;
	}
}

function image_process() {
	if (current_hm_cut >= round.beatmap.cuts.length) return;
	let update = false;
	while (audio_ctx.currentTime > round.beatmap.cuts[current_hm_cut]) {
		current_hm_cut ++;
		if (current_hm_cut >= round.beatmap.cuts.length) return;
		update = true;
	}
	if (Math.random()>0.1) update = false;
	if (update) {
		img_elements[vid_on_display][img_on_display].style.visibility = 'hidden';
		vid_on_display = smart_rand(cuts_rand);
		img_on_display = undefined;
	}
	while (round.beatmap.loops[current_hm_loop] <= audio_ctx.currentTime) {
		last_loop_t = round.beatmap.loops[current_hm_loop];
		current_hm_loop ++;
	}
	let r = (audio_ctx.currentTime-last_loop_t)/(round.beatmap.loops[current_hm_loop]-last_loop_t);
	r += round.video[vid_on_display].metadata.phase_shift;
	r += phase_shift;//(only used for editing)
	r -= Math.floor(r);
	display_img(Math.floor(r*img_elements[vid_on_display].length));
}

function beat_process() {
	let timespan = +gID('r_bblh').value;
	let timeshift = timespan * gID('r_bb0p').value;
	let t0 = audio_ctx.currentTime - timeshift;
	let t1 = t0 + timespan;
	let beat = current_hm_beat;
	let beatpos;
	while (beat>0 && round.beatmap.beats[beat-1]>t0) {
		beat --;
	}
	while (beat<round.beatmap.beats.length && round.beatmap.beats[beat]<t1) {
		beatpos = (round.beatmap.beats[beat]-t0) / timespan;
		draw_beat(beatpos * c.width, (c.height-round.skin.height)*gID('r_bbps').value + round.skin.beat.top);
		beat ++;
	}
}

function ui_process() {
	draw_clear();
	if (!ui_enabled) return;
	draw_layer('back');
	beat_process();
	draw_layer('front');
}

//let img_usage = [];
//let ui_usage = [];
function display_process() {
	//let t0 = Date.now();
	image_process();
	//let t1 = Date.now();
	ui_process();
	/*let t2 = Date.now();
	img_usage.push(t1-t0);
	ui_usage.push(t2-t1);
	if (img_usage.length > 99) {
		console.log('img min: '+Math.min(...img_usage)+'ms\nimg max: '+Math.max(...img_usage)+'ms\nui min: '+Math.min(...ui_usage)+'ms\nui_max: '+Math.max(...ui_usage)+'ms');
		img_usage = [];
		ui_usage = [];
	}*/
	if (video_enabled) window.requestAnimationFrame(display_process);
}

function hitsound_process() {
	if (current_hm_beat >= round.beatmap.beats.length) return;
	while (round.beatmap.beats[current_hm_beat] < audio_ctx.currentTime+interval_t+0.05) {//50ms overhead
		play_hitsound(round.beatmap.beats[current_hm_beat]);
		current_hm_beat ++;
		if (current_hm_beat >= round.beatmap.beats.length) return;
	}
}

function start_round() {
	audio_ctx.resume();
	current_hm_beat = 0;
	interval = setInterval(hitsound_process, interval_t*1000);
	current_hm_cut = 0;
	current_hm_loop = 0;
	last_loop_t = 0;
	video_enabled = true;
	display_process();
}

function clear_round() {
	//clear intervals, audio context, img elements, etc
}

function init_skin(layer) {
	let cnt = 0;
	let src;
	while (cnt < round.skin[layer].length) {
		to_load ++;
		src = round.skin[layer][cnt].img;
		round.skin[layer][cnt].img = new Image();
		round.skin[layer][cnt].img.onload = load_handler;
		round.skin[layer][cnt].img.src = src;
		cnt ++;
	}
}

function initialize_round() {
	//t_offset = max(0, beat[0] - loop[0])
	cuts_rand = init_rand(round.video.length);
	hitsound_merger = audio_ctx.createGain();//needed because the gain keeps reseting with connect()
	hitsound_merger.connect(hitsound_gain);
	let music = audio_ctx.createBufferSource();

	//load the hitsound
	audio_ctx.decodeAudioData(base64ToArrayBuffer(round.hitsound)).then((buffer)=>{
		round.hitsound = buffer;
		console.log('hitsound loaded');

		//load the music
		audio_ctx.decodeAudioData(base64ToArrayBuffer(round.music)).then((buffer)=>{
			music.buffer = buffer;
			music.connect(music_gain);
			music.start(0);//(t_offset)
			round_duration = music.buffer.duration;
			console.log('music loaded');

			//load the video cuts
			let cnt = 0;
			while (cnt < round.video.length) {
				to_load += round.video[cnt].data.length;
				cnt ++;
			}
			load_hdl_f = ()=>{
				console.log('video cuts loaded');

				//load the skin elements
				to_load += 2;
				init_skin('back');
				init_skin('front');
				let src = round.skin.beat.img;
				round.skin.beat.img = new Image();
				round.skin.beat.img.onload = load_handler;
				round.skin.beat.img.src = src;
				load_hdl_f = ()=>{
					console.log('skin loaded');

					//start playing the round
					console.log('loading process done');
					start_round();
				};
				load_handler();
			};
			cnt = 0;
			while (cnt < round.video.length) {
				load_video(cnt);
				cnt ++;
			}
			vid_on_display = 0;
		});
	});
}

function parse_obj(obj) {
	if (obj.metadata.version != json_file_version) {
		console.log('error: wrong file version\nversion: '+obj.metadata.version+', expected: '+json_file_version);
		return;
	}
	switch (obj.metadata.type) {
		case 'collection':
			let cnt = 0;
			while (cnt < obj.data.length) {
				parse_obj(obj.data[cnt]);
				cnt ++;
			}
			break;
		case 'music':
			round.music = obj.data;
			break;
		case 'hitsound':
			round.hitsound = obj.data;
			break;
		case 'beatmap':
			round.beatmap = obj.data;
			break;
		case 'video':
			round.video.push(obj);
			break;
		case 'settings':
			set_settings(obj);
			break;
		case 'skin':
			let skin_ctr = 0;
			let skin_elm;
			round.skin.back = [];
			round.skin.front = [];
			round.skin.beat = undefined;
			while (skin_ctr < obj.data.length) {
				skin_elm = obj.data[skin_ctr];
				if (skin_elm.layer == 'back') {
					round.skin.back.push(skin_elm);
				}
				if (skin_elm.layer == 'front') {
					round.skin.front.push(skin_elm);
				}
				if (skin_elm.layer == 'beat') {
					round.skin.beat = skin_elm;
				}
				skin_ctr ++;
			}
			round.skin.height = obj.metadata.height;
			round.skin.range = obj.metadata.range;
			round.skin.progress_range = obj.metadata.progress_range;
			break;
		default:
			break;
	}
}

function load() {
	let reader = new FileReader();
	let files = gID('file_input').files;
	let cnt = 1;
	console.log('loading files...');
	reader.onload = (event)=>{
		let data;
		try {
			data = JSON.parse(reader.result);
		} catch (e) {
			console.log('asset reading error:\n'+e);
		}
		if (data != undefined) parse_obj(data);
		if (cnt < files.length) {
			console.log(cnt+'/'+files.length+' loaded');
			reader.readAsText(files[cnt]);
			cnt ++;
		} else {
			console.log('file loading finished');
			initialize_round();
		}
	};
	if (files.length > 0) reader.readAsText(files[0]);
}