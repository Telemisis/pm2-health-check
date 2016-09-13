
var pmx = require('pmx');
var pm2 = require('pm2');

/******************************
 *    ______ _______ ______
 *   |   __ \   |   |__    |
 *   |    __/       |    __|
 *   |___|  |__|_|__|______|
 *
 *      PM2 Health Check Module
 *
 ******************************/

/**
 *    Module system documentation
 *       http://bit.ly/1hnpcgu
 *
 *   Start module in development mode
 *          $ cd to my-module
 *          $ pm2 install .
 *
 *  Official modules are published here
 *      https://github.com/pm2-hive
 */

/**
 *           Module Entry Point
 *
 *  We first initialize the module by calling
 *         pmx.initModule({}, cb);
 *
 *
 * More options: http://bit.ly/1EpagZS
 *
 */
pmx.initModule({

	// Options related to the display style on Keymetrics
	widget : {

		// Logo displayed
		logo : 'https://raw.githubusercontent.com/Telemisis/pm2-health-check/master/logo.png',

// Module colors
// 0 = main element
// 1 = secondary
// 2 = main border
// 3 = secondary border
theme            : ['#141A1F', '#222222', '#3ff', '#3ff'],

// Section to show / hide
el : {
	probes  : true,
	actions : true
},

	// Main block to show / hide
	block : {
		actions : false,
		issues  : true,
		meta    : true,

		// Custom metrics to put in BIG
		main_probes : ['test-probe']
	}

}

}, function(err, conf) {

	/**
	 * Module specifics like connecting to a database and
	 * displaying some metrics
	 */

	/**
	 *                      Custom Metrics
	 *
	 * Let's expose some metrics that will be displayed into Keymetrics
	 *   For more documentation about metrics: http://bit.ly/1PZrMFB
	 */
	var Probe = pmx.probe();

	var metric_failure_count = 0;

	/**
	 * .metric, .counter, .meter, .histogram are also available (cf doc)
	 */
	var val = Probe.metric({
		name : 'failures',
		value : function() {
			return metric_failure_count;
		},
		/**
		 * Here we set a default value threshold, to receive a notification
		 * These options can be overriden via Keymetrics or via pm2
		 * More: http://bit.ly/1O02aap
		 */
		alert : {
			mode     : 'threshold',
			value    : 1,
			msg      : 'Process health check failed!'
		}
	});

	// Health check
	pm2.connect(function() {
		setInterval(function () {
			// every 10 seconds, list process handled by pm2
			pm2.list(function (err, list) {
				list.forEach(function (process) {
					// and for each send a healthcheck request
					pm2.sendDataToProcessId({
						type : 'healthcheck',
						data : {},
						id   : process.pm2_env.pm_id
					}, function(err, res) {
						// response will be actually called using the EventBus of pm2
						// but err can be filled with eventual error while communicating with pm2 daemon
					});
				}
			}
		}, 10000);

		pm2.launchBus(function(err, bus) {
			// listen for healthcheck response here
			pm2_bus.on('process:msg:healtcheck', function(packet) {
				if(!packet.data.health){
					console.log("Error: Restarting process ID "+ packet.process.pm_id);
					pm2.restart(packet.process.pm_id, function(err, proc){ });
				}
			});
		});					
	});
});
