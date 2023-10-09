/*
Copyright (c) 2017 Davide Gaggero (dGagge.github.io)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var scene, camera, renderer, raycaster, mouse, ctx;
var ParticlesSystem = [];
var INIT_STR = ["Hi! I'm Davide Gaggero", "A Full Stack developer", "Try to hover over this text..", "..or to press any key!"];
var str_index = 0;
var str = INIT_STR[str_index];
var frame = 1;
var keyPressed = false;

function random(min, max) {

	return (Math.random() * (max - min)) + min;

}

function start() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer();
	ParticlesSystem = new PARTICLES_SYSTEM();
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector3(9999, 9999, 0);

	scene.background = new THREE.Color(0xF5F5F5);

	camera.position.z = 15;
	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

	window.addEventListener('mousemove', mouseMove, false);
	window.addEventListener('touchmove', touchMove, false);
	window.addEventListener('touchend', touchEnd, false);
	window.addEventListener('keydown', keyDown, false);

	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	update();

	ParticlesSystem.symbol(INIT_STR[str_index]);

}

function mouseCoord(CX, CY) {

	var x = (CX / window.innerWidth) * 2 - 1;
	var y = -(CY / window.innerHeight) * 2 + 1;
	var v = new THREE.Vector3(x, y, 0);
	v.unproject(camera);
	var dir = v.sub(camera.position).normalize();
	var distance = -camera.position.z / dir.z;
	var pos = camera.position.clone().add(dir.multiplyScalar(distance));
	return pos;

}

function mouseMove(e) {

	var pos = mouseCoord(e.clientX, e.clientY);
	mouse.x = pos.x;
	mouse.y = pos.y;

}

function touchMove(e) {

	e.preventDefault();
	var touches = e.changedTouches;
	var pos = mouseCoord(touches[0].pageX, e.touches[0].pageY);
	mouse.x = pos.x;
	mouse.y = pos.y;

}

function touchEnd(e) {

	e.preventDefault();
	mouse.x = 9999;
	mouse.y = 9999;

}

function keyDown(e) {

	switch (e.key) {

		case "+":
			ParticlesSystem.resize('+');
			break;
			
		case "-":
			ParticlesSystem.resize('-');
			break;

		default:

			if (!keyPressed) {

				keyPressed = true;
				str = '';
		
			}

			ParticlesSystem.symbol(e);

	}

}

function update() {

	if ( (!keyPressed && ((frame / 100) % 2) == 0) ) {

		str_index++;

		if (str_index < INIT_STR.length) {

			ParticlesSystem.symbol(INIT_STR[str_index]);

		} else {
			
			ParticlesSystem.randomEmoji();
			
		}
	
	}

	ParticlesSystem.geometryUpdate();
	renderer.render(scene, camera);
	requestAnimationFrame(update);
	frame++;
}

function PARTICLES_SYSTEM() {

	this.popSize = 200000;
	this.particles = [];
	
	var counter = 0;
	var self = this;

	var _material = new THREE.PointsMaterial({

		color: 0x3C3D3D,
		size: 0.08

	});

	var positions = [];

	var _geometry = new THREE.BufferGeometry();

	this.mesh = new THREE.Points(_geometry, _material);
	this.mesh.geometry.dynamic = true;


	for (var i = 0; i < this.popSize; i++) {

		this.particles.push(new Particle(new THREE.Vector3(0, 0, 0)));
		positions.push(this.particles[i].position.x, this.particles[i].position.y, this.particles[i].position.z);

	}

	const positionsArray = new Float32Array(positions);
	this.mesh.geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));

	scene.add(this.mesh);

	this.symbol = function (e) {

		if (e.keyCode) {

			if (e.keyCode != 8) {

				if (e.keyCode > 46 || e.keyCode == 32) {

					(INIT_STR.indexOf(str) == -1) ? str += e.key: str = e.key;

				} else if (e.keyCode == 46) str = "";

				else return;

			} else {

				(str.length > 1) ? str = str.slice(0, -1) : str = "";

			}

		} else {

			str = e;

		}

		ctx.textBaseline = "middle";
		ctx.textAlign = "center";

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'white';
		ctx.font = "64pt RalewayRegular";

		var fontSize = 64 * (canvas.width - 200) / ctx.measureText(str).width;

		if (fontSize > canvas.height / 2) {

			fontSize = canvas.height / 2;

		}

		ctx.font = fontSize + "pt RalewayRegular";

		ctx.fillText(str, canvas.width / 2, canvas.height / 2);

		var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

		var arrayOfEdges = [];

		for (var x = 0; x < canvas.width; x++) {

			for (var y = 0; y < canvas.height; y++) {

				if (imgData[(y * canvas.width + x) * 4] == 255) {

					arrayOfEdges.push([x, y]);

				}

			}

		}

		for (var i = 0; i < this.popSize; i++) {

			var randomElem = Math.floor(random(0, arrayOfEdges.length));
			var coord = {
				x: 0,
				y: 0
			};

			if (arrayOfEdges.length > 0) {

				coord = mouseCoord((arrayOfEdges[randomElem][0]), (arrayOfEdges[randomElem][1]));

			}

			this.particles[i].address.x = coord.x;
			this.particles[i].address.y = coord.y;

		}

	}

	this.randomEmoji = function () {

		var emojiHex = String.fromCharCode( Math.floor(random(9728, 9983)) );
		this.symbol(emojiHex);

	}

	this.resize = function (zoom) {

		(zoom == '+') ? camera.position.z -= 1: camera.position.z += 1;

	}

	/*this.geometryUpdate = function () {

		for (var i = 0; i < this.popSize; i++) {

			this.particles[i].checkCollision();
			this.particles[i].move();
			//this.mesh.geometry.vertices[i] = this.particles[i].position;

		}

		this.mesh.geometry.verticesNeedUpdate = true;

	}*/

	this.geometryUpdate = function () {
		// Create an array to hold the new positions
		const newPositions = [];
	
		for (let i = 0; i < this.popSize; i++) {
			this.particles[i].checkCollision();
			this.particles[i].move();
			
			// Add the particle positions to the newPositions array
			newPositions.push(
				this.particles[i].position.x,
				this.particles[i].position.y,
				this.particles[i].position.z
			);
		}
	
		// Convert the new positions array to a Float32Array
		const positionsArray = new Float32Array(newPositions);
	
		// Get the positions attribute of your BufferGeometry
		const positionsAttribute = this.mesh.geometry.getAttribute('position');
	
		// Update the positions attribute with the new positions array
		positionsAttribute.array.set(positionsArray);
	
		// Mark the positions attribute as needing an update
		positionsAttribute.needsUpdate = true;
	
	};

}

function Particle(pos) {

	this.position = new THREE.Vector3(random(-22, 22), random(-9, 9), 0);
	this.address = pos;
	this.speed = new THREE.Vector3(0, 0, 0);

	var dist;
	var radiusSquared = 25;

	this.move = function () {

		this.position.x += this.speed.x;
		this.position.y += this.speed.y;

	}

	this.checkCollision = function () {

		dist = this.position.distanceToSquared(mouse);

		if (dist < radiusSquared) {

			this.speed = Follow(dist, this.position, mouse, 'reject');
			return true;

		} else {

			dist = this.position.distanceToSquared(this.address);

			if (dist > 0.01) {

				this.speed = Follow(dist, this.address, this.position, 'attract');
				return true;

			} else {

				this.position = this.address.clone();
				this.speed.x = 0;
				this.speed.y = 0;
				return false;

			}
		}
	}
}

function Follow(dist, obj, obj2, mode) {

	Mouseforce = 1 / dist;
	var angle = Math.atan2(obj.y - obj2.y, obj.x - obj2.x);
	var x = y = 0;

	if (mode == 'attract') {

		Mouseforce = 0.05 + (dist / 150);

	}

	if (Mouseforce > 1) {

		Mouseforce = 1;

	}

	if (angle > (-Math.PI / 2) && angle < Math.PI / 2) {

		x = Mouseforce;
		y = Mouseforce * angle;

	} else {

		(angle > 0) ? angle = Math.PI - angle: angle = -(angle + Math.PI);
		x = -Mouseforce;
		y = Mouseforce * angle;

	}

	return new THREE.Vector2(x, y);

}

function recalculate() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	ParticlesSystem.symbol(str);

}
