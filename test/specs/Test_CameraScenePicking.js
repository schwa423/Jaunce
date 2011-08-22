// Tests CameraRayCaster and SceneIntersector at the same time.

describe("CameraRayCaster and SceneIntersector", function() {
	var scene, camera, cameraHolder;
	var geometry, square1, square2, square3, square4;
	var caster, intersector, chain;

	beforeEach(function() {
		var scale;

		// The scene containing the camera, and all of 
		// the objects to be picked "through" the camera.
		scene = new THREE.Scene();

		// Just to make life difficult, we don't put the
		// camera directly in the scene, instead adding
		// it under a camera holder.  
		cameraHolder = new THREE.Object3D();
		cameraHolder.sceneName = "cameraHolder";
		cameraHolder.position.set(0, -5, 5);
		cameraHolder.rotation.y = Math.PI / 2; 
		cameraHolder.updateMatrix();
		scene.addChild(cameraHolder);

		// The camera's x/y/z axes map to  -z/-x/y axes in world-space, due
		// to the combined rotations of the camera and its parent.  The rays 
		// we shoot will be in the camera's x/z plane.
		// We'll be varying the FOV in the individual test-cases.
		// We also assume that the viewport has a 1-1 aspect ratio;
		// we'll test different FOVs,
		camera = new THREE.Camera(60, 2, 1, 1000, null);
		camera.useTarget = false; // we'll point the camera ourselves, thanks anyway
		camera.sceneName = "camera";
		// The camera points in the negative-z direction of it's coordinate
		// system, so even though this rotation causes the camera's z-axis to
		// point down in world-space, the camera is viewing objects above itself.
		camera.rotation.x = Math.PI / 2;
		cameraHolder.addChild(camera);

		// Vertices that make up a square whose width/height
		// are each 2 units (i.e. one unit in either direction
		// from the square's origin).
		geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

		// Square 1 is set up so that one edge is directly
		// above the camera, in world coordinates.  It is
		// perpendicular to the camera.
		square1 = new THREE.Mesh(geometry);
		square1.sceneName = "square1";
		square1.position.set(0, 10, 6)
		square1.rotation.x = Math.PI / 2;
		scene.addChild(square1);

		// Square 2 is a scene-graph child of Square 1.  Its
		// coordinate system has the same origin, and is rotated
		// about its x-axis by 30 degrees.
		square2 = new THREE.Mesh(geometry);
		square2.sceneName = "square2";
		square2.rotation.x = -Math.PI / 6; 
		square1.addChild(square2);

		// Square 3 is a big-ass square that is behind the camera.
		// It should never be picked, because it is behind the camera.
		square3 = new THREE.Mesh(geometry);
		square3.sceneName = "square3";
		square3.position.set(0, -10, 0);
		square3.rotation.x = -Math.PI / 2;
		scale = square3.scale;
		scale.x = scale.y = scale.y = 100;
		scene.addChild(square3);

		// Square 4 makes Square 3 look teensy-weensy.  It is above
		// Squares 2, 3 (or behind them, from the camera's point of 
		// view).  The point is that all pick-attempts should hit it.
		square4 = new THREE.Mesh(geometry);
		square4.sceneName = "square4";
		square4.position.set(0, 20, 0);
		square4.rotation.x = Math.PI / 2;
		scale = square4.scale;
		scale.x = scale.y = scale.y = 1000;
		scene.addChild(square4);

		// Update matrices of everything in the scene.
		scene.update();

		// Set up event-processing toolchain.
		caster = new CameraRayCaster({ camera: camera });
		intersector = new SceneIntersector({ scene: scene });
		chain = new ToolChain({ tools: [caster, intersector] });
	});

	function setCameraParams(fov, aspect) {
		camera.fov = fov;
		camera.aspect = aspect;
		camera.updateProjectionMatrix();
	}

	it("work with narrow FOV", function() {
		setCameraParams(30, 2);
		var events = [
			// Barely miss the edge of square1.
//			{ type: "mousedown", x: 0.001,	y: 0 },
			// Barely catch the edge of square1.
//			{ type: "mousedown", x: -0.001,	y: 0 },
			// Barely catch the edge of square2 (hit it before square1)  
			{ type: "mousedown", x: -0.001,	y: 0 },
			// Hit square1 first, then square 2. 
//			{ type: "mousedown", x: -0.001,	y: 0 }
		];

		var results = chain.processEvent(events[0]);
		expect(results.length).toEqual(1);
		expect(results[0].intersections.length).toEqual(2);
	});

	it("verify camera look-at", function() {
		expect(false).toBeTruthy();
	});
});