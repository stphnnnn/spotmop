'use strict';

angular.module('spotmop.browse.playlist', [
    'ngRoute'
])

.config(function($routeProvider) {
    $routeProvider.when("/browse/playlist/:uri", {
        templateUrl: "app/browse/playlist/template.html",
        controller: "PlaylistController"
    });
})

.controller('PlaylistController', function PlaylistController( $scope, $rootScope, $route, SpotifyService, SettingsService, $routeParams, $sce ){
	
	// setup base variables
	$scope.playlist = {};
	$scope.tracks = {};
	$scope.totalTime = 0;
    $scope.following = false;
    $scope.followPlaylist = function(){
        SpotifyService.followPlaylist( $routeParams.uri )
            .success( function(response){
                $scope.following = true;
            });
    }
    $scope.unfollowPlaylist = function(){
        SpotifyService.unfollowPlaylist( $routeParams.uri )
            .success( function(response){
                $scope.following = false;
            });
    }
    $scope.deletePlaylist = function(){
        SpotifyService.unfollowPlaylist( $routeParams.uri )
            .success( function(response){
                $scope.following = false;
    			$rootScope.$broadcast('spotmop:notifyUser', {id: 'deleting-playlist', message: 'Playlist deleted', autoremove: true});
            });
    }
    $scope.recoverPlaylist = function(){
        SpotifyService.followPlaylist( $routeParams.uri )
            .success( function(response){
                $scope.following = true;
    			$rootScope.$broadcast('spotmop:notifyUser', {id: 'recovering-playlist', message: 'Playlist recovered', autoremove: true});
            });
    }
    
    $rootScope.$broadcast('spotmop:notifyUser', {type: 'loading', id: 'loading-playlist', message: 'Loading'});

	// on load, fetch the playlist
	SpotifyService.getPlaylist( $routeParams.uri )
		.success(function( response ) {
			$scope.playlist = response;
			$scope.tracks = response.tracks;
		
			// parse description string and make into real html (people often have links here)
			$scope.playlist.description = $sce.trustAsHtml( $scope.playlist.description );
			
			// figure out the total time for all tracks
			var totalTime = 0;
			$.each( $scope.tracks.items, function( key, track ){
				totalTime += track.track.duration_ms;
			});	
			$scope.totalTime = Math.round(totalTime / 100000);
        
            // figure out if we're following this playlist
            SpotifyService.isFollowingPlaylist( $routeParams.uri, SettingsService.getSetting('spotifyuserid',null) )
                .success( function( isFollowing ){
                    $scope.following = $.parseJSON(isFollowing);
                    $rootScope.$broadcast('spotmop:notifyUserRemoval', {id: 'loading-playlist'});
                });
		})
        .error(function( error ){
            $rootScope.$broadcast('spotmop:notifyUserRemoval', {id: 'loading-playlist'});
            $rootScope.$broadcast('spotmop:notifyUser', {type: 'bad', id: 'loading-playlist', message: error.error.message});
        });
});