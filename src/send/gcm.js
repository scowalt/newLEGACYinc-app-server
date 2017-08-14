module.exports = function( db ) {
	// Library imports
	var FCM = require( 'fcm-node' );

	// Setup
	var fcmSender = new FCM( process.env.FCM_API_KEY );

	function send( title, messageText, key, callback ) {

		// Construct message
		var message = {
			collapse_key: key,

			notification: {
				title: title,
				body: messageText
			}
		};

		fcmSender.send( message, function( error, response ) {
			if ( error ) {
				var util = require( 'util' );
				console.error( 'FCM send error' );
				console.log( util.inspect( error, { showHidden: false, depth: null } ) );
			}

			callback( error );
		} );
	}

	return {
		send: send
	};
};
