// A Negotiator is a tool that finds the proper tool for the job.  If there is already an active tool, then 
// subsequent events are processed by that tool, until it decides that it is finished, at which point there
// is no longer an active tool.  On the other hand, if there is no active tool, then the negotiator uses its
// target finder to find an object to negotiate with to select an active tool.  Once it finds a target, it 
// negotiates with that target to select the appropriate active tool.
Class('Negotiator', {
	isa: Tool,
	has: {
		activeTool: null,
		targetFinder: null,
	},
	methods: {
		processEvent: function(event) {
			if (!this.activeTool) {
				var i, targets = this.targetFinder.findTargets(event);
				for (i=0; i<targets.length; i++) {
					this.activeTool = this.findToolForEvent(targets[i], event);
					if (this.activeTool) break; // found one!
				}
			}
			if (this.activeTool) {
				var outputEvents = this.activeTool.processEvent(event);

				// Determine whether we need to deactivate the active tool.
				if (outputEvents.some(function(event) { return event.type === "deactivate"; })) {
					this.activeTool = null;
					return outputEvents.filter(function(event) { return event.type !== "deactivate"; });
				}
				else {
					// No need to deactivate the active tool, so return the list of output events as-is.
					return outputEvents;
				}
			}
			// Pass the event on, in case someone else wants it.
			return [event];
		},
		findToolForEvent: function(target, event) {
			// Subclass responsibility
			return null;
		}
	}
});
