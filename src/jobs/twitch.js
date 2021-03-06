module.exports = function( common, db, sender ) {
	// Module imports
	var moment = require( 'moment' );
	var request = require( 'request' );

	// Private variables
	var KEY = 'Twitch';
	const redisClient = db.getRedisClient();
	const LAST_ONLINE_KEY = 'TWITCH_CHANNEL_STATUS';

	function isLive( callback ) {
		common.twitch.getProfileInfo( function( err, stream ) {
			if ( err ) {
				console.error( 'Failure to get the twitch profile info' );
				console.error( err );
				callback( err );
			} else {
				callback( err, stream );
			}
		} );
	}

	// notify users that about the stream status
	function notify( message, callback ) {
		const title = 'Live on Twitch!';
		sender.send( title, message, KEY, callback );
	}

	function job( callback ) {
		isLive( function( isLiveError, newInfo ) {
			redisClient.get( LAST_ONLINE_KEY, function gotLastOnline( redisGetError, previouslyOnline ) {
				if ( redisGetError ) {
					console.error( `Failed to get ${LAST_ONLINE_KEY} from redis database` );
					console.error( redisGetError );
					callback( redisGetError );
				} else {
					if ( isLiveError ) {
						callback();
					} else {
						const currentInfo = newInfo ? newInfo.channel.status : null;
						const shouldNotify = ( !previouslyOnline ) && currentInfo;

						var afterRedisAction = function( redisError ) {
							if ( redisError ) {
								console.error( `Failed to set ${LAST_ONLINE_KEY} from redis database` );
								console.error( redisError );
							}

							if ( shouldNotify ) {
								notify( currentInfo, callback );
							} else {
								callback();
							}
						};

						if ( currentInfo ) {
							redisClient.set( LAST_ONLINE_KEY, currentInfo, afterRedisAction );
						} else {
							redisClient.del( LAST_ONLINE_KEY, afterRedisAction );
						}
					}
				}
			} );
		} );
	}

	return {
		job: job
	};
};
