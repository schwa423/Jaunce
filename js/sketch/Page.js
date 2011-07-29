(function() {

// Used in definition of Jaunce Page class.
var initCamera = function() {
	var camera = new THREE.Camera();
	camera.projectionMatrix = THREE.Matrix4.makeOrtho(-500, 500, 500, -500, -10000, 10000);
	camera.position.z = 1000;
	return camera;
};

// Used in definition of Jaunce Page class.
var initScene = function() {
	var scene = new THREE.Scene();

	var cubeGeometry = new THREE.CubeGeometry(10, 10, 10);
	var cube1 = new THREE.Mesh(cubeGeometry, new THREE.MeshLambertMaterial({ color: 0xff0000 }));	
	cube1.position.x = -0.5;
	cube1.position.y = -0.5;
	cube1.position.z = 0;
	scene.addObject(cube1);

	var cube2 = new THREE.Mesh(cubeGeometry, new THREE.MeshLambertMaterial({ color: 0x00ff00 }));	
	cube2.position.x = 0.5;
	cube2.position.y = 0.5;
	cube2.position.z = 0;
	scene.addObject(cube2);

	return scene;
};

var initRenderTarget = function() {
	return new THREE.WebGLRenderTarget(
		1024, 
		1024, 
		{ 
			minFilter: THREE.LinearFilter, 
			magFilter: THREE.NearestFilter,
			format: THREE.RGBFormat
		}
	);
};

Class('Page', {
	meta: Joose.Meta.Class,
	// Subclass THREE.Mesh so that we can be inserted directly into a THREE.Scene.
	// It's awesome that Joose allows us to subclass non-Joose classes!
	isa: THREE.Mesh,
	has: {
		camera: { is: 'r', init: initCamera },
		scene: { is: 'r', init: initScene },
		renderTarget: { is: 'r', init: initRenderTarget }
	},
	methods: {
		initialize: function(props) {
			var geometry = new THREE.PlaneGeometry(3, 2, 10, 10);
			var material = new THREE.MeshBasicMaterial({ map: this.renderTarget });
			THREE.Mesh.call(this, geometry, material);
		},

		update: function(parentMatrixWorld, forceUpdate, camera, renderer) {
			if (!this.lastUpdateTime || (Date.now() - this.lastUpdateTime) > 100) {
				this.lastUpdateTime = Date.now();
// NOT QUITE READY... NEEDS HACKED VERSION OF THREE.JS				
//				renderer.render(this.scene, this.camera, this.renderTarget, true);
			}

			this.SUPER(parentMatrixWorld, forceUpdate, camera, renderer);
		}
	}
});



})();