Class('SceneIntersector', {
	isa: Tool,
	has: {
		scene: null
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

			// Cannot pick unless scene is specified.
			if (!this.scene) {
				console.warn("scene must be specified");
				return [];
			}

			event = Joose.O.getMutableCopy(event);
			event.intersections = event.ray.intersectScene(this.scene);

			return [event];
		}
	}
});