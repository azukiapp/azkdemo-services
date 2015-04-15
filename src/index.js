var express = require('express');
var fs      = require('fs');
var url     = require('url');
var path    = require('path');
var expressLayouts = require('express3-ejs-layout');
var rootPath = path.normalize(path.join(__dirname, '..'));
var log = console.log;

// Configs
var PORT     = process.env.HTTP_PORT || 3000;
var AZK_UID  = process.env.AZK_UID;

// Database is configured
var client;
if (process.env.DATABASE_URL) {
  var redis   = require('redis');
  var options = url.parse(process.env.DATABASE_URL);
  client = redis.createClient(options.port, options.hostname);
}

// App
var app    = express();
var server = require('http').Server(app);
var io     = require('socket.io')(server);

// Simple logger
app.use(function(req, res, next) {
  console.log('%s: %s %s', AZK_UID, req.method, req.url);
  next();
});

// Send mail
app.get('/mail', require('./send_email.js'));

// setup views with ejs
app.use('/public', express.static(path.join(rootPath, 'public')));
app.set('views',    path.join(rootPath, 'views'));
app.set('view engine',  'ejs');
app.use(expressLayouts);

app.get('/', function(req, res) {
  if (client) {
    client.get('counter', function(err, counter) {
      if (err) console.error(err);
      counter = parseInt(counter || 0) + 1;
      client.set('counter', counter, function(err) {
        if (err) console.error(err);
        res.render('home/index.ejs', {
          layout: 'layouts/index',
          counter: counter,
          azk_uid: AZK_UID
        });
      })
    });
  } else {
    res.render('home/index.ejs', {
      layout: 'layouts/index',
      azk_uid: AZK_UID,
      counter: ''
    });
  }
});

server.listen(PORT);
console.log('Service %s is available in port: %s', AZK_UID, PORT);
