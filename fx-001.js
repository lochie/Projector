var fx = (function(){
	var version = 1;
	var draw = true;


	/* STUFF */
	var dots = {
		particles:[],
		amount:20,
		bigAmount:100,
	};
	var bricks = {
		particles:[],
		amountX:10,
		amountY:10,
	};

	var wheelTrails = {
		particles:[],
		amount:20,
	};

	/* STUFF */

	function init(){
		reset();
	}
	function reset(){
		brick.reset();
		dot.reset();
		wheelTrail.reset();
	}

	function update(canvas){
		brick.update(canvas);
		dot.update(canvas);
		wheelTrail.update(canvas);
	}
	function move(){
		brick.move();
		dot.move();
		wheelTrail.move();
	}
	function click(){
		brick.click();
		dot.click();
		wheelTrail.click();
	}



	/* STUFF */


	var brick = (function(){
		function reset(){
			bricks.particles = [];
			for (var i=0;i<bricks.amountX;i++){
				for (var j=0;j<bricks.amountY;j++){
					var p = new Particle();
					p.position.x = (main.width/bricks.amountX)*i;
					p.position.y = (main.height/bricks.amountY)*j;
					p.width = (main.width/bricks.amountX);
					p.height = (main.height/bricks.amountY);
					p.alpha = 0.5;
					p.released = false;
			    	p.color = "hsl("+((p.position.x/main.width + p.position.y/main.height) * 180) + ", 100%, 70%)";
					bricks.particles.push(p);
				}
			}
		}
		function update(canvas){
			for (var i=0;i<bricks.particles.length;i++) {
				var p = bricks.particles[i];
				if(p.size <=0 || p.alpha <=0 || (p.position.y > main.height)){
					bricks.particles.splice(i,1);
				}

				p.position.x += p.velocity.x;
				p.position.y += p.velocity.y;

				if(p.released){
					p.velocity.y += 0.1;
				}


				if(draw){
					canvas.ctx.save();
						canvas.ctx.globalAlpha = p.alpha;
						canvas.ctx.beginPath();
						canvas.ctx.fillStyle = p.color;
						canvas.ctx.rect(p.position.x, p.position.y, p.width, p.height);
						canvas.ctx.fill();
					canvas.ctx.restore();
				}
			}
		}
		function move(){
			for (var i=0;i<bricks.particles.length;i++){
				var p = bricks.particles[i];
				if( !p.released && mouseIsWithin(p.position.x,p.position.y,p.width,p.height) ){
					p.velocity.x = -5 + Math.random()*10;
					p.velocity.y = -5 + Math.random()*10;
					p.released = true;
				}
			}
		}
		function click(){
			move();
		}
		return {
			reset:reset,
			update:update,
			move:move,
			click:click,
		}
	})();


	var dot = (function(){
		function reset(){
			dots.particles = [];
		}
		function update(canvas){
			for (i=0;i<dots.particles.length;i++) {
				var p = dots.particles[i];
				if(p.size <=0 || p.alpha <=0 || (p.position.x < 0 || p.position.y < 0) || (p.position.x > main.width || p.position.y > main.height)){
					dots.particles.splice(i,1);
				}

				p.position.x += p.velocity.x;
				p.position.y += p.velocity.y;
				p.alpha -= p.fadeRate;
				p.size -= 0.1;

				if(draw){
					canvas.ctx.save();
						canvas.ctx.globalAlpha = p.alpha;
						canvas.ctx.beginPath();
						canvas.ctx.fillStyle = p.color;
						canvas.ctx.arc(p.position.x, p.position.y, p.width/2, 0, Math.PI*2, true);
						canvas.ctx.fill();
					canvas.ctx.restore();
				}
			}
		}
		function move() {
			for (var i=0;i<dots.amount;i++) {
				var p = new Particle();
				p.width = 1;
				var force = 10;
				p.velocity = {x: (force/2) - Math.random()*force, y: (force/2) - Math.random()*force};
				dots.particles.push(p);
			}
		}
		function click() {
			for (var i=0;i<dots.bigAmount;i++) {
				var p = new Particle();
					p.width = 10;
					p.height = 10;
					var force = 10;
					p.velocity = {x: Math.random()*force-Math.random()*force, y: Math.random()*force-Math.random()*force};
					p.fade = 0.01;
			    	p.color = "hsl("+((p.position.x/main.width + p.position.y/main.height) * 180) + ", 100%, 70%)";
				dots.particles.push(p);
			}
		}
		return {
			reset:reset,
			update:update,
			move:move,
			click:click,
		}
	})();


	var wheelTrail = (function(){
		function reset(){
			wheelTrails.particles = [];
		}
		function update(canvas){
			var maxSize = 20;

			wheelTrails.particles.unshift({x:main.mouse.x,y:main.mouse.y});
			if(wheelTrails.particles.length > maxSize) wheelTrails.particles.splice(wheelTrails.particles.length-1,1);

			canvas.ctx.strokeStyle = "white";
			canvas.ctx.lineWidth = 3;

			var gap = 10;

			canvas.ctx.beginPath();
			for(var i=0;i<wheelTrails.particles.length;i++){
				var p = wheelTrails.particles[i];

				canvas.ctx.save();
					canvas.ctx.globalAlpha = 0.1;
					if(i==0){
						canvas.ctx.moveTo(p.x,p.y-gap);
					}else{
						canvas.ctx.lineTo(p.x,p.y-gap);
					}
					canvas.ctx.stroke();
				canvas.ctx.restore();
			}
			canvas.ctx.closePath();

			canvas.ctx.beginPath();
			for(var i=0;i<wheelTrails.particles.length;i++){
				var p = wheelTrails.particles[i];

				canvas.ctx.save();
					canvas.ctx.globalAlpha = 0.1;
					if(i==0){
						canvas.ctx.moveTo(p.x,p.y+gap);
					}else{
						canvas.ctx.lineTo(p.x,p.y+gap);
					}
					canvas.ctx.stroke();
				canvas.ctx.restore();
			}
			canvas.ctx.closePath();
		}
		function move() {
		}
		function click() {
		}
		return {
			reset:reset,
			update:update,
			move:move,
			click:click,
		}
	})();




	function mouseIsWithin(x,y,w,h){
		return ( (main.mouse.x > x && main.mouse.x < x+w) && (main.mouse.y > y && main.mouse.y < y+h) );
	}
	function Particle() {
	    this.position = { x:main.mouse.x, y:main.mouse.y };
	    this.velocity = { x:0, y:0 };
		this.width = 0;
		this.height = 0;
	    this.color = "#ffffff";
	    this.alpha =  0.1 + Math.random()*0.9;

	    this.size = 2 + Math.random()*3;
		this.fadeRate = Math.random()*0.05;
	}
	return {
		init: init,
		reset: reset,
		update:update,
		move:move,
		click:click,
	}

})();
