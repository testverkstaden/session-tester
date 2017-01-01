(function() {
var services = angular.module('primeService',[]);

services.service('PrimeService', function($http, $q) {

	//Service to grab JSON from primes.json
	var deferred = $q.defer();
	$http.get('json/primes.json').then(function (data)
	{
		deferred.resolve(data);
	});
	
	this.getPrimes = function() {
		return deferred.promise;	
}

});

//end
})();