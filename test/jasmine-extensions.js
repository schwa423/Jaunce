if (!jasmine.Matchers.prototype.toBeNear) {
	jasmine.Matchers.prototype.toBeNear = function(val) {
		return Math.abs(this.actual - val) < 0.000001;
	}
};
