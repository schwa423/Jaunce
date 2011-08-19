describe("PlanePicker", function() {
	var scene, plane, ray, picker, evt;

	beforeEach(function() {
		scene = new THREE.Scene();
		plane = new THREE.Object3D();
		scene.addObject(plane);

		ray = new THREE.Ray();
		picker = new PlanePicker({ plane: plane });
		evt = {
			type: "raydown",
			ray: ray
		};
	});

	it("must support simplest possible case", function() {
		ray.origin = new THREE.Vector3(3, 0, -1);
		ray.direction = new THREE.Vector3(0, 0, 1);

		scene.update();

		var output = picker.processEvent(evt);
		expect(output.length).toEqual(1);
		output = output[0];
		expect(output.type).toEqual("mousedown");
		expect(output.x).toEqual(3);
		expect(output.y).toEqual(0);
	});

	it("must not treat ray as infinite in both directions", function() {
		ray.origin = new THREE.Vector3(3, 0, 1);
		ray.direction = new THREE.Vector3(0, 0, 1);

		scene.update();

		var output = picker.processEvent(evt);
		expect(output.length).toEqual(0); // no intersection
	});

	it("must support picking rotated plane", function() {
		ray.origin = new THREE.Vector3(-1, 0, -3);
		ray.direction = new THREE.Vector3(2, 1, 2);

		plane.useQuaternion = true;
		plane.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/4);

		scene.update();

		var output = picker.processEvent(evt);
		expect(output.length).toEqual(1);
		output = output[0];
		expect(output.type).toEqual("mousedown");
		expect(output.x).toBeNear(Math.sqrt(2));
		expect(output.y).toEqual(1);
	});

	// Same as "must support picking rotated plane" except that
	// the plane is scaled up in world-space by a factor of two, 
	// and therefore the intersection point is scaled down in 
	// plane-space by a factor of two.
	it("must support picking scaled plane", function() {
		ray.origin = new THREE.Vector3(-1, 0, -3);
		ray.direction = new THREE.Vector3(2, 1, 2);

		plane.scale.set(2,2,2);
		plane.useQuaternion = true;
		plane.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/4);

		scene.update();

		var output = picker.processEvent(evt);
		expect(output.length).toEqual(1);
		output = output[0];
		expect(output.type).toEqual("mousedown");
		expect(output.x).toBeNear(Math.sqrt(2)/2);
		expect(output.y).toEqual(0.5);

	});

	// Similar to "must support picking rotated plane", except with
	// an extra parent-node.
	it("must support picking deeper into a hierarchy", function() {
		ray.origin = new THREE.Vector3(-1, 0, -3);
		ray.direction = new THREE.Vector3(2, 1, 2);

		scene.removeChild(plane);
		var obj = new THREE.Object3D();
		scene.addChild(obj);
		obj.addChild(plane);

		// Rotate parent object by 90 degrees, and plane 
		// by 45 degrees in the opposite direction.
		obj.useQuaternion = true;
		obj.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
		plane.useQuaternion = true;
		plane.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/4);

		obj.translateY(5);
		plane.translateY(-3);

		scene.update();

		var output = picker.processEvent(evt);
		expect(output.length).toEqual(1);
		output = output[0];
		expect(output.type).toEqual("mousedown");
		expect(output.x).toBeNear(Math.sqrt(2));
		expect(output.y).toBeNear(-1);
	});
});