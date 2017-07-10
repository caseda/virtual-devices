"use strict";

// a list of devices, with their 'id' as key
// it is generally advisable to keep a list of
// paired and active devices in your driver's memory.
var devices = {};

module.exports.init = function(devices_data, callback) {
	console.log("Initializing away driver");

	// when the driver starts, Homey rebooted. Initialise all previously paired devices.
	devices_data.forEach(function(device_data) {
		initDevice(device_data);
	})

	// let Homey know the driver is ready
	callback();
}

//the `added` method is called is when pairing is done and a device has been added
module.exports.added = function(device_data, callback) {
	console.log("Adding device " + device_data.id);

	initDevice(device_data);
	callback(null, true);
};

//the `delete` method is called when a device has been deleted by a user
module.exports.deleted = function(device_data, callback) {
	console.log("Deleting device " + device_data.id);
	delete devices[device_data.id];
	callback(null, true);
};

// the `pair` method is called when a user start pairing
module.exports.pair = function(other) {
	other
		.on('list_devices', function(data, callback) {

			var device_data = {
				name: "Virtual away",
				data: {
					id: guid()
				}
			}

			console.log("Added Virtual away: " + device_data.data.id);
			callback(null, [device_data]);

		})
};

//module.exports.renamed = function( device_data, new_name ) {
// run when the user has renamed the device in Homey.
// It is recommended to synchronize a device's name, so the user is not confused
// when it uses another remote to control that device (e.g. the manufacturer's app).
//}

//these are the methods that respond to get/set calls from Homey
//for example when a user pressed a button
module.exports.capabilities = {};
module.exports.capabilities.onoff = {};

// this function is called by Homey when it wants to GET the state, e.g. when the user loads the smartphone interface
// `device_data` is the object as saved during pairing
// `callback` should return the current value in the format callback( err, value )
module.exports.capabilities.onoff.get = function(device_data, callback) {

	var virtualaway = getaway(device_data.id);
	if (virtualaway instanceof Error) 
		return callback(virtualaway);
	
	// send the state value to Homey
	callback(null, virtualaway.state.onoff);
};

// this function is called by Homey when it wants to SET the awayes state, e.g. when the user presses the button on
// the smartphone
// `device_data` is the object as saved during pairing
// `onoff` is the new value
// `callback` should return the new value in the format callback( err, value )
module.exports.capabilities.onoff.set = function(device_data, onoff, callback) {
	var virtualaway = getaway(device_data.id);
	if (virtualaway instanceof Error) 
		return callback(virtualaway);
	
	virtualaway.state.onoff = onoff;
	var state = virtualaway.state;
	var tokens = {
		"type": "device"
	};

	if (onoff) {
		console.log("Turning on  " + virtualaway.data.id);

		Homey
			.manager('flow')
			.triggerDevice('virtual_away_on', tokens, state, device_data, function(err, result) {
				if (err) 
					return console.error(err);
				}
			);
	} else {
		console.log("Turning off " + virtualaway.data.id);

		Homey
			.manager('flow')
			.triggerDevice('virtual_away_off', tokens, state, device_data, function(err, result) {
				if (err) 
					return console.error(err);
				}
			);
	}

	// also emit the new value to realtime
	// this produces Insights logs and triggers Flows
	module
		.exports
		.realtime(device_data, 'onoff', onoff);

	// send the new onoff value to Homey
	callback(null, virtualaway.state.onoff);
};

Homey
	.manager('flow')
	.on('condition.virtual_away', function(callback, args) {
		var virtualaway = getaway(args.device.id);
		if (virtualaway instanceof Error) 
			return callback(virtualaway);
		
		callback(null, virtualaway.state.onoff);
	});

Homey
	.manager('flow')
	.on('action.virtual_away_action_on', function(callback, args) {
		var virtualaway = getaway(args.device.id);
		if (virtualaway instanceof Error) 
			return callback(virtualaway);
		
		virtualaway.state.onoff = true;
		var state = virtualaway.state;
		var tokens = {
			"type": "device"
		};

		Homey
			.manager('flow')
			.triggerDevice('virtual_away_on', tokens, state, args.device, function(err, result) {
				if (err) 
					return console.error(err);
				}
			);
		module
			.exports
			.realtime(args.device, 'onoff', true);

		callback(null, true);
	});

Homey
	.manager('flow')
	.on('action.virtual_away_action_off', function(callback, args) {
		var virtualaway = getaway(args.device.id);
		if (virtualaway instanceof Error) 
			return callback(virtualaway);
		
		virtualaway.state.onoff = false;
		var state = virtualaway.state;
		var tokens = {
			"type": "device"
		};

		Homey
			.manager('flow')
			.triggerDevice('virtual_away_off', tokens, state, args.device, function(err, result) {
				if (err) 
					return console.error(err);
				}
			);
		module
			.exports
			.realtime(args.device, 'onoff', false);

		callback(null, true);
	});

//a helper method to get a away from the devices list by it's id
function getaway(away_id) {
	var device = devices[away_id];
	if (typeof device === 'undefined') {
		return new Error("Could not find Virtual away " + away_id);
	} else {
		return device;
	}
}

//a helper method to add a away to the devices list
function initDevice(device_data) {
	console.log("Device initialized " + device_data.id);
	console.log("Data = " + JSON.stringify(device_data));
	devices[device_data.id] = {};
	devices[device_data.id].state = {
		onoff: false
	};
	devices[device_data.id].data = device_data;

	//    module.exports.getSettings( device_data, function( err, settings ){
	//    	console.log(JSON.stringify(settings));
	//    })
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
