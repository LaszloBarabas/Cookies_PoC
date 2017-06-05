

// load express module
var express = require('express'); 

// load logging module 
var morgan = require('morgan'); 

// load cookie-parser 
var cookieParser = require('cookie-parser');

// set the host name 
var hostname 	= 'localhost'; 
//set the port nr
var port 	= 3030; 


// create the general app context 
var app		= express(); 

// start the middleware 

app.use(morgan('dev'));

// start the middleware 
app.use(cookieParser('1234-5678')); // cookies signed with a secret key


// create a function 
/**
 *  req: request obj
 *  resp: response obj
 *  next : to call the next middleware in the chain 
 *
 */ 
function auth( req, resp, next ){
	console.log(req.headers);

	// just if it's cookie is empty, not set 
	if (!req.signedCookies.user) {  
		// extract the authorization header 
		var authHeader = req.headers.authorization; 
		
		// if is it null 
		if (!authHeader) {
			var err = new Error ('You must use authorization (Basic)'); 
			err.status = 401; 
			next (err) ; // call the Error Middleware 
			return; 
		}

		// format 
		// Basic xybhhhhh:33333ddd
		// end of format 
		var auth 	= new Buffer (authHeader.split(' ')[1], 'base64').toString().split(':'); 
		var user  	= auth[0]; 
		var passwd 	= auth[1]; 

		if ( user == 'admin' && passwd == 'password'){
			resp.cookie('user','admin',{signed:true}); // set teh cookie with name: user 
			next(); // athorization successfull
		} else {

			var err = new Error ('Yoou are not athenticated!'); 
			err.status = 401; 
			next (err); 
		}
	} else {

		if (req.signedCookies.user === 'admin') {
			console.log(req.signedCookies); 
			next(); 
		} else { 
			var err = new Error ( 'You are not authenticated!'); 
			err.status = 401; 
			next(err); 

		}

	}
}

//
// start the middleware for authentication 
app.use(auth); 

// start the middleware for serving static files 
app.use(express.static(__dirname +'/public')); 

// Error handling Middleware 
app.use(function (req, resp, next) {
	resp.writeHeader(err.status || 500, 
		{
			'WWW=Authenticate':'Basic',
			'Content-Type':'text/plain'
		}); 
	resp.end(err.message); 
});  

// start the app 
app.listen( port, hostname, function () {
	console.log(`Server running at http://${hostname}:${port}/`); 
}); 


