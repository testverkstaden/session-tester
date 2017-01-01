(function() {
var services = angular.module('sessionService',[]);

services.service('SessionService', function() {

	this.getMinutes = function() {
		return [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,
					80,85,90,95,100,105,110,115,120];
	};
	
	this.getNewSession = function() {
		return {
			"id": 0,
			"start": "",
			"end": "",
			"duration": 0,
			"tester": "",
			"mission": "",
			"notes": "",
			"running": false,
			"done": false,
			"generatedXml": false,
		};
	};

//end
});

})();
