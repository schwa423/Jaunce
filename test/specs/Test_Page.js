describe("Page", function() {
	it("must be a THREE.Mesh", function() {
		var page = new Page();
		expect(page instanceof THREE.Mesh).toBeTruthy();
		expect(page instanceof THREE.WebGLRenderer).toBeFalsy();
	});
});