// Intersects world-space ray with the plane whose normal is the z-vector of the s
// specified object's coordinate system.  Naturally, the origin is on the plane.
// The intersection point is given in the object's coordinate system.
Class('PlanePicker', {
	isa: Tool,
	has: {
		plane: null // 3D object defining reference-frame for plane
	},
	methods: {
		processEvent: function(event) {
			// Ensure we're dealing with a ray-cast event.
			switch(event.type) {
				case "raydown":
				case "rayup":
				case "raymove":
					break;
				default:
					// Pass the event on, in case someone else wants it.
					return [event];
			}

			// Cannot pick unless plane is specified.
			if (!this.plane) {
				console.warn("plane-object must be specified");
				return [];
			}

			// Transform ray into object's coordinate space.  We do this
			// by transforming both the ray's origin and another point
			// on the ray, and subtract the former from the latter to
			// transform the ray's direction.
			var ray = event.ray;
			var mat = this.plane.matrixWorld.makeInvert();
			var origin = mat.multiplyVector3(ray.origin.clone());
			var another = mat.multiplyVector3( ray.origin.clone().addSelf(ray.direction) );
			var direction = another.subSelf(origin);
			var intersection;

			// Now that we're in the object's coordinate space, we just need
			// to intersect with the z=0 plane.
			if (direction.z === 0)  {
				// Special case: there are either zero or infinite intersections
				// with the plane.  Either way, there's no sensible event that
				// we can generate, so don't return one.
				return [];
			}
			if (direction.z * origin.z > 0) {
				// Ray is pointing away from plane, so it doesn't intersect.
				return [];
			}
			if (origin.z === 0) {
				intersection = origin;
			}
			else {
				// Uugh, too bad JavaScript can't use operators as method selectors...
				// this would be way less ugly.
				intersection = origin.addSelf(direction.multiplyScalar(origin.z / -direction.z));
			}

			event = {
				type: "mouse" + event.type.slice(3),  // replace "ray" with "mouse"
				x: intersection.x,
				y: intersection.y,
				planeIntersection: intersection
			};
			return [event];
		}
	}
});