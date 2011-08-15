describe("Tool event-processing", function() {

	it("can transform/generate events, and process them in a chain", function() {
		var strokes = []

		var offsetMouseEventTool = new Tool();
		offsetMouseEventTool.processEvent = function(event) {
			if ( -1 === ["mousedown", "mousemove", "mouseup"].indexOf(event.type)) {
				// Not a mouse-event, so pass it on unchanged.
				return [event];
			}
			var transformed = Joose.O.getMutableCopy(event);
			transformed.x = event.x + 10;
			transformed.y = event.y + 15;
			return [transformed];
		};

		var penTool = new Tool();
		penTool.processEvent = function(event) {
			switch(event.type) {
				case "mousedown":
					this.stroke = [];
					this.stroke.push({x: event.x, y: event.y});
				break;
				case "mousemove":
					this.stroke.push({x: event.x, y: event.y});
				break;
				case "mouseup":
					this.stroke.push({x: event.x, y: event.y});
					strokes.push(this.stroke);
					this.stroke = null;
				break;
				default:
					// Pass it through
					return [event];
			}
			// If it was mousedown/move/up, swallow it.
			return [];
		};

		var chain = new ToolChain({tools: [offsetMouseEventTool, penTool]});

		// Process events corresponding to a couple of strokes.		
		[	// first stroke
			{ type: "mousedown", x: 0, y: 0 },
			{ type: "mousemove", x: 0.5, y: 2 },
			{ type: "mousemove", x: 1.0, y: 4 },
			{ type: "mousemove", x: 1.5, y: 6 },
			{ type: "mousemove", x: 2.0, y: 6 },
			{ type: "mouseup", x: 2.5, y: 7 },
			// ignored event... passed on through
			{ type: "passthrough", foo: 423, bar: 999},
			// second stroke
			{ type: "mousedown", x: -5, y: -1 },
			{ type: "mousemove", x: -4, y: -3 },
			{ type: "mousemove", x: -3, y: -5 },
			{ type: "mouseup", x: -2, y: -7 }
		].forEach(function(event) { chain.processEvent(event)});

		expect(strokes.length).toEqual(2);

		// The values in each quadruple are as follows:
		// - stroke index
		// - index of point within stroke
		// - x or y component of point
		// - expected value
		[
			[0,0,"x",10],
			[0,0,"y",15],
			[0,1,"y",17],
			[0,2,"y",19],
			[0,5,"x",12.5],
			[1,0,"x",5],
			[1,0,"y",14],
			[1,2,"x",7],
			[1,2,"y",10],
			[1,3,"x",8],
			[1,3,"y",8]
		].forEach(function(quad) {
			var sInd = quad[0];
			var pInd = quad[1];
			var comp = quad[2];
			var val = quad[3];
			expect(strokes[sInd][pInd][comp]).toEqual(val);
		});

		// Test that unrecognized events are passed right on through.
		var outEvents = chain.processEvent({ type: "passthrough", foo: 423, bar: 999});
		expect(outEvents.length).toEqual(1);
		expect(outEvents[0].foo).toEqual(423);
	});

	it("can negotiate with target to select appropriate tool", function() {

		// 3 pages to draw on.  The second one doesn't want events, so 
		// they "pass right through it".
		var targets = [
			{ wantsEvents: true, name: "page0", strokes: [] },
			{ wantsEvents: false, name: "page1", strokes: [] },
			{ wantsEvents: true, name: "page2", strokes: [] }
		]

		// Standin for eg: a 3D picker function that will calculate
		// where the mouse-ray intersects with the page in 3D space.
		var targetFinder = function(event) {
			if (!event.hasOwnProperty("targetIndex")) return [];
			if (event.targetIndex < 0 || event.targetIndex >= targets.length) return [];
			return targets.slice(event.targetIndex);
		};
		targetFinder.findTargets = targetFinder;

		// Instantiate a negotiator, and bash in the funcion that it will use
		// to generate a suitable pen-tool.
		var negotiator = new Negotiator({targetFinder: targetFinder});
		negotiator.findToolForEvent = function(target, event) {
			// If the target doesn't want events, don't return a tool.
			if (!target.wantsEvents) return null;

			var penTool = new Tool();
			penTool.processEvent = function(event) {
				switch(event.type) {
					case "mousedown":
						this.stroke = [];
						this.stroke.push({x: event.x, y: event.y});
					break;
					case "mousemove":
						this.stroke.push({x: event.x, y: event.y});
					break;
					case "mouseup":
						this.stroke.push({x: event.x, y: event.y});
						target.strokes.push(this.stroke);
						this.stroke = null;
						// This stroke is now finished.
						return [{ type: "deactivate"}];
					break;
					default:
						// Pass it through
						return [event];
				}
				// If it was mousedown/move, swallow it.
				return [];
			};
			return penTool;
		};

		[
			// Stroke that will end up on "page0"
			{ type: "mousedown", targetIndex: 0, x: 0.1, y: 0 },
			{ type: "mousemove", x: 1.1, y: 0 },
			{ type: "mousemove", x: 2.1, y: 0 },
			{ type: "mouseup", x: 3.1, y: 0 },
			// Stroke that will fall through to "page2", 
			// because "page2" isn't interested in handling events.
			{ type: "mousedown", targetIndex: 1, x: 0.2, y: 1 },
			{ type: "mousemove", x: 1.2, y: 1 },
			{ type: "mousemove", x: 2.2, y: 1 },
			{ type: "mouseup", x: 3.2, y: 1 },
			// Stroke that will end up on "page2"
			{ type: "mousedown", targetIndex: 2, x: 0.3, y: 2 },
			{ type: "mousemove", x: 1.3, y: 2 },
			{ type: "mousemove", x: 2.3, y: 2 },
			{ type: "mouseup", x: 3.3, y: 2 }
		].forEach(function(event) { negotiator.processEvent(event); });

		// Check that there is exactly one stroke on the first
		// page, and check one of its values.
		expect(targets[0].strokes.length).toEqual(1);
		expect(targets[0].strokes[0][1].x).toEqual(1.1);

		// Check that there are no strokes on the second page, since
		// it has "wantsEvents" === false.
		expect(targets[1].strokes.length).toEqual(0);

		// Check that the third page has two strokes (the first stroke
		// is the one that "fell through" the second page).
		expect(targets[2].strokes.length).toEqual(2);
		expect(targets[2].strokes[0][1].x).toEqual(1.2);
		expect(targets[2].strokes[1][1].x).toEqual(1.3);
	});

});
