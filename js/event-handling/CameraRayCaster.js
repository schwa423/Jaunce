// Transform an 2D input event, in normalized viewport coordinates, into
// a ray that is used to pick into a scene.  Return a pick-event containing
// the targets intersected by the ray, ordered from nearest to farthest.
Class('CameraRayCaster', {
	isa: Tool,
	has: {
		camera: null,
		projector: { is: 'r', init: new THREE.Projector() }
	},
	methods: {
		processEvent: function(event) {
			// Ensure we're dealing with a mouse event.
			switch (event.type) {
				case "mousedown":
				case "mouseup":
				case "mousemove":
					break;
				default:
					// Pass the event on, in case someone else wants it.
					return [event];
			}

			// Cannot pick unless camera is specified.
			if (!this.camera) {
				console.warn("camera must be specified");
				return [];
			}
			
			var vect = new THREE.Vector3(event.x, event.y, 0.5);
			event = Joose.O.getMutableCopy(event);
			event.type = "ray" + event.type.slice(5); // replace "mouse" with "ray"
			this.projector.unprojectVector(vect, this.camera); // mutates the vector
			var camPos = this.camera.matrixWorld.getPosition();
			event.ray = new THREE.Ray(camPos, vect.subSelf(camPos).normalize());

			return [event];
		}
	}
});
