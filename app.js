/*jshint node: true */
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname, 'public')));
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("Serwer nasłuchuje na porcie " + app.get('port'));
});

var io = require('socket.io');
var socket = io.listen(server);

var players=[];
var card_deck=[];


socket.on('connection', function (client) {
    'use strict';

    var index;

    client.on("join", function (msg){
            var i;
            players.push(client);
            for(i=0;i<players.length;i+=1){
                if(client===players[i]){
                index=i;
                };
            };
            players[index].ready = 0;
            client.broadcast.emit("message","Player " + client.id + " joined.");
            client.emit("message","You joined.");
            client.broadcast.emit("player_nr","Players:" + players.length);
            client.emit("player_nr","Players:" + players.length);
    });
    client.on("ready",function (msg){
            var i;
            players[index].ready = 1;
            var allReady=true;
            for(i=0;i<players.length;i+=1){
                if(players[i].ready !== 1){
                allReady = false;
                break;
                };
            };
            if(allReady === true){
            client.emit("message","ALL READY!");
            client.broadcast.emit("message","ALL READY!");
            };
    });
    client.on('disconnect', function() {
       
       players.splice(index,1);
       client.broadcast.emit("message","Player " + client.id + " left.");
       client.broadcast.emit("player_nr","Players:"+players.length);
    });
});