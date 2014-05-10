var customMatchers={
	toBeInstanceOf: function(util, customEqualityTesters) { return {
		compare: function(actual,expected) {
			var result={ pass: actual instanceof expected };
			if(result.pass) {
				result.message="Expected " + actual + " to NOT be an instance of " + expected;
			} else {
				result.message="Expected " + actual + " to be an instance of " + expected;
			}
			return result;
		}
	};},
	toContainAll: function(util, customEqualityTesters) { return {
		compare: function(actual,expected) {
			var missing=[];
			
			for(var i=0; i < expected.length;++i) {
				if(!util.contains(actual,expected[i],customEqualityTesters)) {
					missing.push(expected[i]);
				}
			}
			
			if(missing.length === 0) {
				return {
					pass: true,
					message: "Expected " + actual + " to not contain [" + expected.join(",") + "]"
				};
			} else {
				return {
					pass: false,
					message: "Expected " + actual + " to contain [" + missing.join(",") + "]"
				};
			}
		}
	};}
};