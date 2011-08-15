Class('Tool', {
	methods: {
		// Tools may implement any behavior that they want to.
		// Once they're done, they return an array of zero or 
		// more events that may be processed by other tools.
		processEvent: function(event) {
			return [];
		}
	}
});
