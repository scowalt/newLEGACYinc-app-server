// http://stackoverflow.com/a/16800702/1222411
module.exports = function() {
	// Import libraries
	var mongoose = require( 'mongoose' );
	mongoose.connect( process.env.MONGODB_URI );

	var deviceSchema = new mongoose.Schema( {
		// Indexes
		id: {
			type: String,
			required: true,
			unique: true,
			index: true
		},
		type: {
			type: String,
			enum: [ 'GCM' ], // other types may be available later
			required: true,
			unique: false,
			index: true
		},

		// Notification settings
		twitch: {
			type: Boolean,
			default: true
		},
		hitbox: {
			type: Boolean,
			default: true
		},
		youTube: {
			type: Boolean,
			default: true
		}
	} );
	var Device = mongoose.model( 'Device', deviceSchema );

	// Import modules
	var settings = require( __dirname + '/settings' )( mongoose, Device );

	var addRegistrationId = function( id, type, callback ) {
		var newDevice = new Device( { id: id, type: type } );
		newDevice.save( function( error, device ) {
			if ( !error || error.code === 11000 /* duplicate */ ) {
				callback( false, device );
			} else {
				callback( error );
			}
		} );
	};

	var getRegistrationIds = function( type, key, callback ) {
		var queryConditions = {
			type:type
		};
		if ( key ) {
			queryConditions[ key ] = true;
		}
		Device.find( queryConditions ).select( 'id -_id' ).exec( function( error, devices ) {
			if ( error ) {
				console.log( error );
				callback( error );
			} else {
				var ids = [];
				devices.forEach( function( device ) {
					ids.push( device.id );
				} );
				callback( false, devices );
			}
		} );
	};

	/**
	 * Remove row from database
	 * @param id
	 */
	function removeRegistrationId( id ) {
		Device.findOneAndRemove( { id: id }, function( error ) {
			if ( error ) {
				// Since this ID has previously been confirmed to be present in
				// the database, this operation should never error.
				console.error( error );
			}
		} );
	}

	return {
		addRegistrationId: addRegistrationId,
		getRegistrationIds: getRegistrationIds,
		removeRegistrationId: removeRegistrationId,
		settings: settings
	};
};
