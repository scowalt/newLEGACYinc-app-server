// http://stackoverflow.com/a/16800702/1222411
module.exports = function(){
	// import mysql library
	var mysql = require('mysql');

	// initialize connection pool
	var pool = mysql.createPool({
		'host': process.env.DB_HOST,
		'user': process.env.DB_USER,
		'password': process.env.DB_PASS,
		'database': process.env.DB_DATABASE,
		'connectionLimit': 5,
		'supportBigNumbers': true
	});

	// import modules
	var settings = require(__dirname + '/settings')(pool);

	var addRegistrationId = function (id, type, callback){
		var sql = 'INSERT INTO devices (id, type) VALUES (?, ?)';
		var inserts = [id, type];
		pool.getConnection(function(err, connection){
			if (err){
				console.log(err);
				callback(err);
				return;
			}
			connection.query(sql, inserts, function(err, result){
				connection.release();
				if(err){
					callback(err, result);
					return;
				}
				callback(false, result);
			});
		});
	}

	var getRegistrationIds = function(type, key, callback){
		var sql = 'SELECT (id) from devices WHERE type = ?';
		var inserts = [ type ];
		if (key){
			sql += ' AND ?? = 1';
			inserts.push(key);
		}
		pool.getConnection(function(err, connection){
			if (err){
				console.log(err);
				callback(err);
				return;
			}
			connection.query(sql,inserts,function(err, rows){
				connection.release();
				if (err){
					console.log(err);
					callback(err);
					return;
				}
				var results = []
				rows.forEach(function(row){
					results.push(row.id);
				});
				callback(false, results);
			});
		})
	}

	/**
	 * Remove row from database
	 * @param id
	 */
	function removeRegistrationId(id){
		var sql = 'DELETE from devices WHERE id = ?';
		var inserts = [ id ];
		pool.getConnection(function(err, connection){
			if (err){
				console.log(err);
				return;
			}
			connection.query(sql,inserts,function(err, rows){
				connection.release();
				if (err){
					console.log(err);
					return;
				}
			});
		})
	}

	return {
		addRegistrationId: addRegistrationId,
		getRegistrationIds: getRegistrationIds,
		removeRegistrationId: removeRegistrationId,
		settings: settings
	};
}
