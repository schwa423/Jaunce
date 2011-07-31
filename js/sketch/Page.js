(function() {

// Used in definition of Jaunce Page class.
var initCamera = function() {
	var camera = new THREE.Camera();
	camera.position.z = 1000;
	return camera;
};

// Used in definition of Jaunce Page class.
var initScene = function() {
	var scene = new THREE.Scene();

	var cubeGeometry = new THREE.CubeGeometry(0.8, 0.8, 0.8);
	var cube1 = new THREE.Mesh(cubeGeometry, new THREE.MeshLambertMaterial({ color: 0xff0000 }));	
	cube1.position.x = -0.3;
	cube1.position.y = -0.3;
	cube1.position.z = 0;
	scene.addObject(cube1);

	var cube2 = new THREE.Mesh(cubeGeometry, new THREE.MeshLambertMaterial({ color: 0x00ff00 }));	
	cube2.position.x = 0.3;
	cube2.position.y = 0.3;
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


// Design goals:
// - When you make a page bigger or smaller, the content on it is scaled accordingly.  For
//   example, if you have a page in a 3d space and you grow it to be as tall as a building,
//   then the drawings on it as similarly large.  If you want to zoom into the Page contents,
//   then you must do this manually.
Class('Page', {
	meta: Joose.Meta.Class,
	// Subclass THREE.Mesh so that we can be inserted directly into a THREE.Scene.
	// It's awesome that Joose allows us to subclass non-Joose classes!
	isa: THREE.Mesh,
	has: {
		camera: { is: 'r', init: initCamera },
		scene: { is: 'r', init: initScene },
		renderTarget: { is: 'r', init: initRenderTarget },
		width: 1,
		height: 1
	},
	methods: {
		initialize: function(props) {
			var geometry = new THREE.PlaneGeometry(this.width, this.height, 10, 10);
			var material = new THREE.MeshBasicMaterial({ map: this.renderTarget });
		
			var w = this.width, h = this.height;
			this.width = this.height = null;  // otherwise nothing will happen; see guard at start of setWidthAndHeight()
			this.setWidthAndHeight(w,h);

			THREE.Mesh.call(this, geometry, material);
		},

		// For now, can only be called at creation-time.  To do it at a later time requires more
		// investigation.  Should we just create new geometry?  Should we just scale the existing
		// geometry?
		setWidthAndHeight: function(newWidth, newHeight) {
			if (this.width === newWidth && this.height === newHeight) return;  // nothing changed
			this.width = newWidth;
			this.height = newHeight;

			// Our smaller dimension (width/height) determines the scale for the page content.
			var aspect = newWidth / newHeight;
			this.camera.projectionMatrix =
				aspect > 1 
				? THREE.Matrix4.makeOrtho(-1*aspect, 1*aspect, 1, -1, -10000, 10000 )
				: THREE.Matrix4.makeOrtho(-1, 1, 1/aspect, -1/aspect, -10000, 10000 )
		},

		// This requires a modified version of Three.js... updating ourself involved
		// potentially rendering into our texture, and in order to do this we need
		// access to a renderer.
		update: function(parentMatrixWorld, forceUpdate, outerCamera, renderer) {
			if (!this.lastUpdateTime || (Date.now() - this.lastUpdateTime) > 100) {
				this.lastUpdateTime = Date.now();
				
				// Render the updated page contents.
				renderer.render(this.scene, this.camera, this.renderTarget, true);
			}

			// Countinue updating ourself just like any other THREE.Mesh; we'll soon be 
			// rendered using the texture containing the rendered page-contents.
			this.SUPER(parentMatrixWorld, forceUpdate, outerCamera, renderer);
		}
	}
});

})();
