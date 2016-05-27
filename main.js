var main = (function(){

	var settings = {		
		//gridFile: "grid/001.txt",
		width: 600,
		height: 250,
		x:0, y:0,
		map:{ x:14, y:8 },
		projection:{
			showLines:false,
			warp:true,
			fade:true,
		},
		localPreview:{
			show:true,
			deck:2,
			coping:7,
			mapImage:"http://i.imgur.com/JvhAYfr.jpg",
			/*
			mapImage:"http://i.imgur.com/3DDuA2Y.jpg",
			width: 1093,
			height: 455,
			*/
		},
	};

	var canvas = {};
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || setTimeout;

	function init(){

		canvas = {
			main: cnvs.create('canvas'),
			pre: cnvs.create(),
			fx: cnvs.create(),
			projector: cnvs.create(),
		};
		document.getElementById('interactive').appendChild(canvas.main.c);
		document.getElementById('projection').appendChild(canvas.projector.c);
		
		listeners();

		grid.init(settings.gridFile, function(){
			fx.init();
			projection.init();
			loop();
		});
	}
	function loop(){
		if(grid.isModify()){
			drawers.grid();
		}else{
			drawers.effects();
			drawers.pre();
			drawers.main();
		}

		drawers.projector();
		document.querySelector("#fps").innerHTML = fps.getFPS()+"/60";

		requestAnimationFrame(loop);
	}



	var mouse = {
		x: null,
		y: null,
		isDown: false,
		isDragging:false,
		trail: {
			size:10,
			points:[],
			update:function(){
				mouse.trail.points.unshift({x:mouse.x,y:mouse.y});
				if(mouse.trail.points.length > mouse.trail.size) mouse.trail.points.splice(mouse.trail.points.length-1,1);

				canvas.main.ctx.strokeStyle = "white";
				canvas.main.ctx.lineWidth = 3;

				canvas.main.ctx.beginPath();
				for(var i=0;i<mouse.trail.points.length;i++){
					var p = mouse.trail.points[i];

					canvas.main.ctx.save();
						canvas.main.ctx.globalAlpha = 0.3;
						if(i==0){
							canvas.main.ctx.moveTo(p.x,p.y);
						}else{
							canvas.main.ctx.lineTo(p.x,p.y);
						}
						canvas.main.ctx.stroke();
					canvas.main.ctx.restore();
				}
			}
		},
	};

	var keyboard = {
		isDown:false,
		lastKey:null,
		code:{
			a:65,
			s:83,
			d:68,
			f:70,
			g:71,
			h:72,
		}
	};



	function doMove(){
		if(grid.isModify()){
		}else{
			fx.move();
		}
	}
	function doClick(){
		if(grid.isModify()){
		}else{
			fx.click();
			mouseClick();
		}
	}
	function mouseClick(){
	}



	function listeners(){
		document.getElementById("modify").addEventListener('click', grid.modify, false);
		document.getElementById("export").addEventListener('click', grid.export, false);
		
		document.addEventListener('keydown', documentKeyboardDownHandler, false);
		document.addEventListener('keyup', documentKeyboardUpHandler, false);

		document.addEventListener('mousemove', documentMouseMoveHandler, false);
		document.addEventListener('mousedown', documentMouseDownHandler, false);
		document.addEventListener('mouseup', documentMouseUpHandler, false);

		canvas.main.c.addEventListener('touchstart', canvasTouchStartHandler, false);
		canvas.main.c.addEventListener('touchmove', canvasTouchMoveHandler, false);
		canvas.main.c.addEventListener('touchend', canvasTouchEndHandler, false);
	}
	function setMousePosition(x,y){
		mouse.x = x;
		mouse.y = y;
	}


	function documentKeyboardUpHandler(e){
		keyboard.isDown = false;
	}
	function documentKeyboardDownHandler(e){
		keyboard.isDown = true;
		keyboard.lastKey = e.keyCode;
	}


	function documentMouseMoveHandler(event) {
		setMousePosition(event.clientX,event.clientY);
		if(mouse.isDown) doMove();
	}
	function documentMouseDownHandler(event) {
		mouse.isDown = true;
		doClick();
	}
	function documentMouseUpHandler(event) {
		mouse.isDown = false;
		mouse.isDragging = false;
	}

	function canvasTouchMoveHandler(event) {
		if(event.touches.length == 1) {
			event.preventDefault();
			setMousePosition(event.touches[0].pageX,event.touches[0].pageY);
			doMove();
		}
	}
	function canvasTouchStartHandler(event) {
		if(event.touches.length == 1) {
			event.preventDefault();
			setMousePosition(event.touches[0].pageX,event.touches[0].pageY);
			mouse.isDown = true;
			doClick();
		}
	}
	function canvasTouchEndHandler(event) {
		if(event.touches.length == 1) {
			mouse.isDown = false;
		}
	}



/* 	DRAWERS */

	var drawers = (function(){

		function mouseIsWithin(x,y,w,h){
			return ( (mouse.x > x && mouse.x < x+w) && (mouse.y > y && mouse.y < y+h) );
		}

		function main(){
			cnvs.clear(canvas.main);
			birdseye(canvas.main.ctx);
			//if(settings.localPreview.show) canvas.main.ctx.drawImage(canvas.pre.c,0,0);
			guides(canvas.main.ctx);
			mouse.trail.update();
		}


		function birdseye(ctx) {
			var w = (settings.width/settings.map.x)*settings.localPreview.deck;
			// ramp
			ctx.fillStyle = '#dcbf97';
			ctx.fillRect(0, 0, settings.width, settings.height);
			// coping
			ctx.fillStyle = '#000000';
			ctx.fillRect(0, 0, w+settings.localPreview.coping, settings.height);
			ctx.fillRect(settings.width-(w+settings.localPreview.coping), 0, w+settings.localPreview.coping, settings.height);
			// deck
			ctx.fillStyle = '#b89762';
			ctx.fillRect(0, 0, w, settings.height);
			ctx.fillRect(settings.width-w, 0, w, settings.height);
		}


		var mapPreview = new Image();
			mapPreview.src = settings.localPreview.mapImage;
		function modifyGrid(){
			cnvs.clear(canvas.main);
			var ctx = canvas.main.ctx;
			if(settings.localPreview.mapImage) ctx.drawImage(mapPreview,0,0);
			//ctx.fillStyle = 'rgba(0,0,0,0.3)';
			//ctx.fillRect(0, 0, canvas.main.c.width, canvas.main.c.height);

			var size = 10;
			ctx.fillStyle = "#ff0000";

			var theGrid = grid.getGrid();

			// Group pins
			if(keyboard.isDown && (keyboard.lastKey == keyboard.code.a)){
			// Relocate all pins
				var mX = mouse.x - theGrid[0][0].x;
				var mY = mouse.y - theGrid[0][0].y;
				for(var i=0;i<theGrid.length;i++){
					for(var j=0;j<theGrid[i].length;j++){
						var p = theGrid[i][j];
						p.x += mX;
						p.y += mY;

						ctx.fillRect((p.x)-(size/2), (p.y)-(size/2), size, size);
					}
				}
			}else if(keyboard.isDown && (keyboard.lastKey == keyboard.code.s)){
			// Downsize
				for(var i=0;i<theGrid.length;i++){
					for(var j=0;j<theGrid[i].length;j++){
						var p = theGrid[i][j];
						p.x /= 1.01;
						p.y /= 1.01;

						ctx.fillRect((p.x)-(size/2), (p.y)-(size/2), size, size);
					}
				}
			}else if(keyboard.isDown && (keyboard.lastKey == keyboard.code.d)){
			// Upsize
				for(var i=0;i<theGrid.length;i++){
					for(var j=0;j<theGrid[i].length;j++){
						var p = theGrid[i][j];
						p.x *= 1.01;
						p.y *= 1.01;

						ctx.fillRect((p.x)-(size/2), (p.y)-(size/2), size, size);
					}
				}
			}else if(keyboard.isDown && (keyboard.lastKey == keyboard.code.f)){
				// Relocate column
			}else if(keyboard.isDown && (keyboard.lastKey == keyboard.code.g)){
				// Relocate row
			}else{
			// Drag individual pin
				for(var i=0;i<theGrid.length;i++){
					for(var j=0;j<theGrid[i].length;j++){
						var p = theGrid[i][j];

						if(mouse.isDown && !mouse.isDragging){
							if(mouseIsWithin((p.x)-(size/2), (p.y)-(size/2), size, size)){
								p.isDragged = true;
								mouse.isDragging = true;
							}else{
								p.isDragged = false;
							}
						}
						if(p.isDragged && mouse.isDragging){
							p.x = mouse.x;
							p.y = mouse.y;
						}else{
							p.isDragged = false;
						}

						ctx.fillRect((p.x)-(size/2), (p.y)-(size/2), size, size);
					}
				}
			}
			grid.setGrid(theGrid);

		}
		function guides(ctx){
			var size = 5;
			ctx.fillStyle = "#ff0000";

			for(var i=0;i<settings.map.x+1;i++){
				for(var j=0;j<settings.map.y+1;j++){
					var x = settings.width/settings.map.x;
					var y = settings.height/settings.map.y;
					ctx.fillRect((i*x)-(size/2), (j*y)-(size/2), size, size);
				}
			}
		}

		function pre(){
			cnvs.clear(canvas.pre);
			canvas.pre.ctx.drawImage(canvas.fx.c, 0, 0);
		}
		function effects(){
			cnvs.clear(canvas.fx);
			canvas.fx.ctx.clearRect(0, 0, settings.width, settings.height);
			fx.update(canvas.fx);
		}
		function projector(){
			projection.update(canvas.pre,canvas.projector);
		}

		return {
			main:main,
			grid:modifyGrid,
			guides:guides,
			effects:effects,
			pre:pre,
			projector:projector,
		}
	})();


	return {
		init:init,
		width:settings.width,
		height:settings.height,
		map:settings.map,
		mouse:mouse,
		projection:function(){ return settings.projection; }
	}

})();
/* CANVAS CONTROL */
var cnvs = (function(){
	function clearCanvas(canvas){
		canvas.ctx.clearRect(0, 0, canvas.c.width, canvas.c.height);
	}
	function createCanvas(id){
		id = id || "";
		var c = document.createElement("canvas"),
			ctx = c.getContext("2d");
			c.width = main.width;
			c.height = main.height;
			c.id = id;
		return {
			c:c,
			ctx:ctx
		};
	}
	return {
		create:createCanvas,
		clear:clearCanvas
	}
})();

var fps = {	startTime : 0,	frameNumber : 0,	getFPS : function(){		this.frameNumber++;		var d = new Date().getTime(),			currentTime = ( d - this.startTime ) / 1000,			result = Math.floor( ( this.frameNumber / currentTime ) );		if( currentTime > 1 ){			this.startTime = new Date().getTime();			this.frameNumber = 0;		}		return result;	}	};