var connect = require('connect');

var servers=[
    { dir: "sample/server", port: 13000 },
    { dir: "sample/widget1", port: 13001 },
    { dir: "sample/monolithic", port: 13010 },
		{ dir: "test/server",port: 14000 },
		{ dir: "test/widget1",port: 14001 },
		{ dir: "test/widget2",port: 14002 }
];

var widgets=[];

servers.forEach(function(s) {
	var dir=__dirname + "/" + s.dir;

	console.log("Serving " + dir + " on port " + s.port);

	widgets.push(
		connect()
			.use(connect.logger('dev'))
			.use("/js",connect.static(__dirname+ "/app"))
			.use("/lib",connect.static(__dirname+ "/lib"))
			.use(connect.static(dir))
			.listen(s.port)
	);
});
