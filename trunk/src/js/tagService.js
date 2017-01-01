(function() {
var services = angular.module('tagService',[]);

services.service('TagService', function($http, $q) {

	//Service to grab JSON from tags.json
	var deferred = $q.defer();
	$http.get('json/tags.json').then(function (data)
	{
		deferred.resolve(data);
	});
	
	this.getTag = function() {
		return deferred.promise;	
	}
});

//end
})();
