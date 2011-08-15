// A ToolChain is a Tool that is composed of other tools.  It doesn't do any event-processing
// itself, but instead passes them into the top tool, whose output becomes the input to the
// next tool, and so on.
Class('ToolChain', {
	isa: Tool,
	has: {
		tools: null
	},
	methods: {
		initialize: function(props) {
			this.tools = this.tools || [];
		},
		push: function(tool) {
			this.tools.push(tool);
		},
		firstTool: function() {
			return this.tools[0];
		},
		lastTool: function() {
			return this.tools[this.tools.length-1];
		},
		processEvent: function(event, index) {
			// If this is called like a normal tool, then there will be no
			// "index" argument.  We add one, to support recursive invocation
			// of this function.
			if (!index) index = 0;

			// Bulletproofing.
			if (index >= this.tools.length) return [event];

			// Process the event with the current tool, and process 
			// the resulting events with the next tool (if any).
			var resultingEvents = this.tools[index].processEvent(event);
			if (index === this.tools.length - 1) {
				// No more downstream tools, so return the events that we already have.
				return resultingEvents;
			}
			else if (!resultingEvents.length) {
				// Also, if there are no resulting events, there is nothing to pass to downstream tools.
				return resultingEvents; // or equivalently (except for the extra allocation), return [];
			}
			else {
				// There is a downstream tool, so process all resulting events with it, and
				// concatenate them into a single array.  Note that event-processing occurs 
				// in a depth-first manner.
				var that = this;
				var downstreamEvents = resultingEvents.map(function(e) { return that.processEvent(e, index+1); });
				return Array.prototype.concat(downstreamEvents.shift(), downstreamEvents);
			}
		}
	}
});

