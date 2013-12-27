var mqtt = require('mqtt');

mqtt.createServer(function(client) {
    client.on('connect', function(packet) {
        client.connack({returnCode: 0});

        console.log('connected:' + client.id);
    });

    client.on('publish', function(packet) {

    });

    client.on('subscribe', function(packet) {
        console.log('subscribed:' + client.id);
    });

    client.on('pingreq', function(packet) {
        client.pingresp();
    });

    client.on('disconnect', function(packet) {
        client.stream.end();
    });

    client.on('close', function(err) {
    });

    client.on('error', function(err) {
        client.stream.end();
        console.dir(err);
    });

}).listen(process.argv[2] || 11883);
