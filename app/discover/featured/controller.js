angular.module('spotmop.discover.featured', [])

/**
 * Routing 
 **/
.config(function($stateProvider) {
	$stateProvider
		.state('discover.featured', {
			url: "/featured",
			templateUrl: "app/discover/featured/template.html",
			controller: 'FeaturedController'
		});
})
	
/**
 * Main controller
 **/
.controller('FeaturedController', function FeaturedController( $scope, $rootScope, SpotifyService ){	
	
	// set the default items
	$scope.playlists = [];
	$rootScope.requestsLoading++;
	
	SpotifyService.featuredPlaylists()
		.success(function( response ) {
			$scope.playlists = response.playlists.items;
            $rootScope.requestsLoading--;
		})
        .error(function( error ){
            $rootScope.requestsLoading--;
            $rootScope.$broadcast('spotmop:notifyUser', {type: 'bad', id: 'loading-featured-playlists', message: error.error.message});
        });
});