let canvas = document.createElement("canvas");
canvas.setAttribute("width", "800");
canvas.setAttribute("height", "500");
document.body.appendChild(canvas);
let ctx = canvas.getContext("2d");				//creates the canvas, sets height and width

ctx.font = "Bolder 48px Century Gothic";

let title = new Image();
title.src = "img/title.png"
title.onload = function(){
	ctx.drawImage(title,0,0) //draw the image once it has loaded; javascript resource management is weird
}

let snd_music = new Audio("audio/music.mp3");
let snd_coin = new Audio("audio/coin.wav");
let snd_enemy_defeat = new Audio("audio/enemy_defeat.wav");
let snd_jump = new Audio("audio/jump.wav");					//all of the audio for the game. located in audio/

let toast = new Image();
toast.src = "img/toast/idle.png"
let background = new Image();
background.src = "img/background0.png"
let ground0 = new Image();
ground0.src = "img/ground0.png"
let ground1 = new Image();
ground1.src = "img/ground1.png"
let ground2 = new Image();
ground2.src = "img/ground2.png"
let coin = new Image();
coin.src = "img/coin.png"					//all of the images needed for the game, have to be declared in a different way


let fpsinterval, starttime, now, then, elapsed; //used for framerate limiting
let targetfps = 60;								//target FPS
snd_music.loop = true							//loop the music when it plays
let typingchallenge = false
let typedword = ""								//both of these manage the typing challenge
const typechecker = /^[A-Za-z]$/ //regex: checks if in range A-Z or a-z, then if it is a single character exact match.
let wordarray = ["wear","temple","bronze","tread","sunday","banner","flash","race",
"thank","cat","lip","europe","shorts","pole","method","option","mom","wake","design",
"flawed","march","seed","fun","sphere","post","belly","happy","shell","patent","old","good",
"mud","tone","beard","head","square","horse","union","dog","wage","fear","open","gummy",
"can","leg","nail","spell","affect","choose","family"] //all of the possible words for the typing challenge
let wordindex = 0 
let wordstotype = 0
let youwin = false										//more typing vars, like how many words have been iterated through

canvas.addEventListener("click", gamescript, false)		//adds an event listener; when you click the canvas it starts the main script

function randominrange(a,b){							//returns a random integer in the range a,b
	a = Math.ceil(a)
	b = Math.floor(b)
	return Math.floor(Math.random() * (b - a + 1) + a);
}

function gamescript(){									//this is the main game script
	document.addEventListener("keydown", keydownhandler, false);
	document.addEventListener("keyup", keyuphandler, false);
	canvas.removeEventListener("click", gamescript, false);		//remove that click listener to prevent the game script running multiple times.

	const sz = 96 //player sprite size, used for collision calculations
	let moverate = 2;	//rate at which the player object moves. setting it to anything other than 2 breaks it for some reason
	let keyarray = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]; //array to hold all of the interactible keys
	let pressedkeys = [false, false, false, false];						//and checks if the keys are held down
	let gravity = -12; //gravity, adjustable. used for playeraccel calculations
	let allowmove = [true, true, true, true]	//tracks collision left and right, with and without globalscroll.
	let gameover = false						//tracks if the player has died

	player = {"x":50, "y":50, "accel":0, "jumpforce":6, "ycoll":false, "score":0} //stores important player-related vars like position and accel
	level = [	//holds the level data, each block has a pos, and a type. w and h are just used for collision
		{"x":0, "y":430, "w":70, "h":70,"type":0},
		{"x":70, "y":430, "w":70, "h":70,"type":0},
		{"x":140, "y":430, "w":70, "h":70,"type":0},
		{"x":210, "y":430, "w":70, "h":70,"type":0},
		{"x":280, "y":430, "w":70, "h":70,"type":0},
		{"x":350, "y":430, "w":70, "h":70,"type":0},
		{"x":420, "y":430, "w":70, "h":70,"type":0},
		{"x":490, "y":430, "w":70, "h":70,"type":0},
		{"x":560, "y":430, "w":70, "h":70,"type":2},
		{"x":560, "y":360, "w":70, "h":70,"type":1},
		{"x":630, "y":430, "w":70, "h":70,"type":2},
		{"x":630, "y":360, "w":70, "h":70,"type":1},
		{"x":700, "y":430, "w":70, "h":70,"type":2},
		{"x":700, "y":360, "w":70, "h":70,"type":1},
		{"x":770, "y":430, "w":70, "h":70,"type":2},
		{"x":770, "y":360, "w":70, "h":70,"type":2},
		{"x":770, "y":290, "w":70, "h":70,"type":1},
		{"x":1050, "y":430, "w":70, "h":70,"type":2},
		{"x":1050, "y":360, "w":70, "h":70,"type":2},
		{"x":1050, "y":290, "w":70, "h":70,"type":1},
		{"x":1120, "y":430, "w":70, "h":70,"type":2},
		{"x":1120, "y":360, "w":70, "h":70,"type":1},
		{"x":1190, "y":430, "w":70, "h":70,"type":0},
		{"x":1260, "y":430, "w":70, "h":70,"type":0},
		{"x":1330, "y":430, "w":70, "h":70,"type":0},
		{"x":1400, "y":430, "w":70, "h":70,"type":0},
		{"x":1470, "y":430, "w":70, "h":70,"type":0},
		{"x":1540, "y":430, "w":70, "h":70,"type":0},
		{"x":1610, "y":430, "w":70, "h":70,"type":0},
		{"x":1680, "y":430, "w":70, "h":70,"type":2},
		{"x":1680, "y":360, "w":70, "h":70,"type":1},
		{"x":1750, "y":430, "w":70, "h":70,"type":2},
		{"x":1750, "y":360, "w":70, "h":70,"type":1},
		{"x":1820, "y":430, "w":70, "h":70,"type":2},
		{"x":1820, "y":360, "w":70, "h":70,"type":1},
		{"x":1890, "y":430, "w":70, "h":70,"type":2},
		{"x":1890, "y":360, "w":70, "h":70,"type":1},
		{"x":1960, "y":430, "w":70, "h":70,"type":0},
		{"x":2030, "y":430, "w":70, "h":70,"type":0},
		{"x":2100, "y":430, "w":70, "h":70,"type":0},
		{"x":2170, "y":430, "w":70, "h":70,"type":0},
		{"x":2240, "y":430, "w":70, "h":70,"type":0},
		{"x":2310, "y":430, "w":70, "h":70,"type":0},
		{"x":2380, "y":430, "w":70, "h":70,"type":0},
		{"x":2450, "y":430, "w":70, "h":70,"type":0},

		{"x":2520, "y":360, "w":70, "h":70,"type":1},
		{"x":2590, "y":220, "w":70, "h":70,"type":1},
		{"x":2660, "y":220, "w":70, "h":70,"type":1},
		{"x":2730, "y":360, "w":70, "h":70,"type":1},
		{"x":2590, "y":290, "w":70, "h":70,"type":2},
		{"x":2660, "y":290, "w":70, "h":70,"type":2},
		{"x":2590, "y":360, "w":70, "h":70,"type":2},
		{"x":2660, "y":360, "w":70, "h":70,"type":2},
		{"x":2520, "y":430, "w":70, "h":70,"type":2},
		{"x":2590, "y":430, "w":70, "h":70,"type":2},
		{"x":2660, "y":430, "w":70, "h":70,"type":2},
		{"x":2730, "y":430, "w":70, "h":70,"type":2},


		{"x":2800, "y":430, "w":70, "h":70,"type":0},
		{"x":2870, "y":430, "w":70, "h":70,"type":0},
		{"x":2940, "y":430, "w":70, "h":70,"type":0},
		{"x":3010, "y":360, "w":70, "h":70,"type":1},
		{"x":3010, "y":430, "w":70, "h":70,"type":2},

		{"x":3220, "y":360, "w":70, "h":70,"type":1},
		{"x":3220, "y":430, "w":70, "h":70,"type":2},
		{"x":3290, "y":430, "w":70, "h":70,"type":0},
		{"x":3360, "y":430, "w":70, "h":70,"type":0},

		{"x":3430, "y":430, "w":70, "h":70,"type":0},
		{"x":3500, "y":430, "w":70, "h":70,"type":0},

		{"x":3570, "y":360, "w":70, "h":70,"type":1}, //1
		{"x":3640, "y":360, "w":70, "h":70,"type":1},
		{"x":3570, "y":430, "w":70, "h":70,"type":2}, //1
		{"x":3640, "y":430, "w":70, "h":70,"type":2},

		{"x":3710, "y":290, "w":70, "h":70,"type":1}, //2
		{"x":3780, "y":290, "w":70, "h":70,"type":1},
		{"x":3710, "y":360, "w":70, "h":70,"type":2}, //2
		{"x":3780, "y":360, "w":70, "h":70,"type":2},
		{"x":3710, "y":430, "w":70, "h":70,"type":2}, //2
		{"x":3780, "y":430, "w":70, "h":70,"type":2},

		{"x":3850, "y":220, "w":70, "h":70,"type":1}, //3
		{"x":3920, "y":220, "w":70, "h":70,"type":1},
		{"x":3850, "y":290, "w":70, "h":70,"type":2}, //3
		{"x":3920, "y":290, "w":70, "h":70,"type":2},
		{"x":3850, "y":360, "w":70, "h":70,"type":2}, //3
		{"x":3920, "y":360, "w":70, "h":70,"type":2},
		{"x":3850, "y":430, "w":70, "h":70,"type":2}, //3
		{"x":3920, "y":430, "w":70, "h":70,"type":2},


		{"x":3990, "y":430, "w":70, "h":70,"type":2},
		{"x":3990, "y":360, "w":70, "h":70,"type":2},
		{"x":3990, "y":290, "w":70, "h":70,"type":2},
		{"x":3990, "y":220, "w":70, "h":70,"type":2},
		{"x":3990, "y":150, "w":70, "h":70,"type":2},
		{"x":3990, "y":80, "w":70, "h":70,"type":2},
		{"x":3990, "y":10, "w":70, "h":70,"type":2},
		{"x":3990, "y":-60, "w":70, "h":70,"type":2}
	]

	let coins = [	//array that holds every coin in the level, with the last one triggering the typing challenge.
		{"x":630, "y": 290, "enabled": true},
		{"x":560, "y": 290, "enabled": true},
		{"x":700, "y": 290, "enabled": true},
		{"x":910, "y": 150, "enabled": true},
		{"x":1330, "y": 360, "enabled": true},
		{"x":1400, "y": 360, "enabled": true},
		{"x":1470, "y": 360, "enabled": true},
		{"x":1680, "y": 150, "enabled": true},
		{"x":1750, "y": 150, "enabled": true},
		{"x":1820, "y": 150, "enabled": true},
		{"x":1890, "y": 150, "enabled": true},
		{"x":2590, "y": 150, "enabled": true},
		{"x":2660, "y": 150, "enabled": true},
		{"x":3080, "y": 150, "enabled": true},
		{"x":3150, "y": 150, "enabled": true},
		{"x":3430, "y": 360, "enabled": true},
		{"x":3500, "y": 360, "enabled": true},
		{"x":3570, "y": 290, "enabled": true},
		{"x":3640, "y": 290, "enabled": true},
		{"x":3710, "y": 220, "enabled": true},
		{"x":3780, "y": 220, "enabled": true},
		{"x":3850, "y": 150, "enabled": true},
		{"x":3920, "y": 150, "enabled": true, "gameender":true}
	]

	let globalscroll = 0 //very important, handles the parallax scrolling and collision.

	let offset = 0; //toast sprite offset to handle
	let flip = "";
	let imagestate = "idle";

	startanimation(targetfps); //runs targetfps, begins rendering.

	function keydownhandler(e){ //handles every keyboard press.
		for(var i = 0; i<keyarray.length; i++) { //for loop iterates through the keyarray to handle every keypress in every direction
			if(e.key == keyarray[i]) {
				pressedkeys[i] = true;
				if(!typingchallenge){
					imagestate = "walk";
				}
			}
		}
		if(typingchallenge) {					//code to handle the typing challenge, like the fake imput box and quiz
			if(e.key == "Backspace") {
				typedword = typedword.slice(0, -1)
			}
			if(typechecker.test(e.key)) {
				typedword += e.key
			}
			if(typedword == chosenquizword) {	//code that checks if the input aligns with the chosenquizword, and if so increment.
				typedword = ""
				chosenquizword = wordarray[randominrange(0,49)]
				player.score += 1000
				wordindex++
				snd_coin.play()
				if(wordindex >= wordstotype) {
					typingchallenge = false
					youwin = true
					setTimeout(function(){youwin = false},5000)
				}
			}
		}
	}

	function keyuphandler(e){ //handles every key up event, only used to set player sprite back to normal.
		for(var i = 0; i<keyarray.length; i++) {
			if(e.key == keyarray[i]) {
				pressedkeys[i] = false;
				if(!pressedkeys[0] && !pressedkeys[1] && !pressedkeys[2] && !pressedkeys[3]) {
					imagestate = "idle"
				}
			}
		}
	}

	function renderloop(){	//loop to manage the rendering and FPS management. if the elapsed time is above fpsinterval, actually render the game.
		requestAnimationFrame(renderloop); //that function can be found right below this one.

		if(imagestate == "idle" && offset >= 4) {
			offset = 0;
		}

		if(imagestate == "walk" && offset >= 8) {
			offset = 0;
		}

		now = Date.now();
		elapsed = now-then;

		if(elapsed > fpsinterval) {
			then = now - (elapsed % fpsinterval);
			rendergame()
		}
	}

	function rendergame(){				//actually renders the game. run per fps interval. (should be around 16.7ms)
		ctx.clearRect(0, 0, canvas.width, canvas.height);  //the following lines clear the canvas, draw the background and level geometry
		for (var i = -1; i <= 4; i++) {						//draw the coins, player, hud, and the typing challenge.
			ctx.drawImage(background,globalscroll/5+background.width*i,-200)
		}

		for(var i = 0; i != level.length; i++) {
			if(level[i].type == 0){
				ctx.drawImage(ground0,level[i].x+globalscroll,level[i].y)
			}
			else if(level[i].type == 1) {
				ctx.drawImage(ground1,level[i].x+globalscroll,level[i].y)
			}
			else if(level[i].type == 2) {
				ctx.drawImage(ground2,level[i].x+globalscroll,level[i].y)
			}
			
		}
		for(var i = 0; i != coins.length; i++) {
			if(coins[i].enabled){
				ctx.drawImage(coin, coins[i].x+globalscroll, coins[i].y)
			}
		}
		ctx.drawImage(toast, 0, offset*sz, sz, sz, player.x, player.y, sz, sz);

		ctx.fillStyle = "#000000"
		ctx.fillText("Score: " + player.score, 20,50)
		if(typingchallenge){
			ctx.fillText("Type the word: " + chosenquizword ,0,canvas.height-60)
			ctx.fillText(typedword ,0 ,canvas.height-10)
		}
		if(youwin){
			ctx.fillText("You Win!", 0, canvas.height-10)
		}
	}

	function gamelogic(){ //game logic routine, gets run every 10ms. allowmove is an array dictating which of these run
		if(!typingchallenge){ //moves the player right without globalscroll, used only at the very beginning 
			if(pressedkeys[0] == true && globalscroll == 0) {
			flip = "flip"
			if(allowmove[0] && player.x > 0) {player.x-=moverate}
		}

		else if(pressedkeys[0] == true) { //move player left with globalscroll, including right-checking collision code
			flip = "flip"
			for(var i = 0; i != level.length; i++) {
				if(player.x == level[i].x+level[i].w+globalscroll && player.y+sz >= level[i].y+6) {
					allowmove[1] = false
				}
			}
			if(allowmove[1]) {globalscroll+=moverate}
		}

		if(pressedkeys[1] == true && player.x < canvas.width/2-sz/2) { //move right without globalscroll,  used only at the very beginning.
			flip = ""
			if(allowmove[2]) {player.x+=moverate}
		}

		else if(pressedkeys[1] == true && player.x == canvas.width/2-sz/2) { //move right with globalscroll, including left-checking coll code.
			flip = ""

			for(var i = 0; i != level.length; i++) {
				if(player.x+sz == level[i].x+globalscroll && player.y+sz >= level[i].y+6){
					allowmove[3] = false
				}
			}
			if(allowmove[3]) {globalscroll-=moverate}
		}
		}
		

		if(player.accel<=8) {player.accel -= gravity/100} //player gravity logic
		if(player.accel>=8) {player.accel = 8} //if accel is above 8, reset to 8
		player.accel = Math.round(player.accel*100)/100 //round to 2dp

		for(var i = 0; i != level.length; i++) { //vertical checking collision code, iterates through every level object and checks individually. -2 is the offset to
			if(player.y+sz >= level[i].y && player.y-sz <= level[i].y + level[i].h) {  //compensate for the horizontal collision.
				if(player.x+sz >= level[i].x+globalscroll+2 && player.x <= level[i].x+level[i].w+globalscroll-2) {
					if(player.accel >= 0) {
						player.accel = 0
						player.ycoll = true
					}
				}
			}
		}

		for(var i = 0; i != coins.length; i++){ //coin collision checking routine. checks if the coin is enabled, then if the player is colliding with it
			if(coins[i].enabled) {				//then disables and adds the player score. if it is an ender coin, it starts the typing challenge.
				if(player.x+sz/2 >= coins[i].x+globalscroll && player.x+sz/2 <= coins[i].x+globalscroll+70 && player.y+sz >= coins[i].y && player.y <= coins[i].y+70){
					coins[i].enabled = false
					snd_coin.play()
					player.score += 100
					if(coins[i].gameender) { //this is executed once, so we need a loop to check recursively
						typingchallenge = true
						chosenquizword = wordarray[randominrange(0,49)]
						wordstotype = player.score/100
					}
				}
			}
		}

		player.y += player.accel //apply momentum
		player.y = Math.round(player.y) //round pos to whole integer

		if(pressedkeys[2] && player.ycoll == true && !typingchallenge) {player.accel=-player.jumpforce; snd_jump.play()} //player jumping code
		toast.src = "img/toast/"+imagestate+flip+".png" //changes the player sprite from running to moving, or flip it.
		player.ycoll = false
		allowmove[0] = true
		allowmove[1] = true
		allowmove[2] = true
		allowmove[3] = true	//resets allowmove every frame.
		if(player.y >= 1000) { //game over the player if they fall down a pit.
			if(!gameover) {
				gameover = true
				gameoverfn();
			}
		}
	}

	function gameoverfn(){ //pause the music, play enemy_defeat sound after 150ms, and after 1000ms, reload the page to reset back to the main menu.
		snd_music.pause()
		setTimeout(function(){
			snd_enemy_defeat.play(); 
			setTimeout(function(){
				location.reload()
			}, 1000)
		}, 150)
	}

	function updateanim(){ //animates the player spritesheet every 85ms
		offset++;
	}

	function startanimation(fps) { //routine that sets up the fps limiter, plays the music, and starts the rendering.
		fpsinterval = 1000/fps;
		then = Date.now();
		starttime = then;
		snd_music.play()
		renderloop();
	}

	setInterval(updateanim, 85); //run sprite animation every 85ms
	setInterval(gamelogic, 10); //run the game logic every 10ms, a nice round number
}