var connect = require('connect');

var servers=[
    { dir: "app", port: 13000 },
		{ dir: "test/tests",port: 14000 },
		{ dir: "test/pingers",port: 14001 }
];

var widgets=[];

servers.forEach(function(s) {
	var dir=__dirname + "/" + s.dir;

	console.log("Serving " + dir + " on port " + s.port);

	widgets.push(
		connect()
			.use(connect.logger('dev'))
			.use(connect.static(dir))
			.listen(s.port)
	);
});
