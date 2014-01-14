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
var table_cards=[];
var round=0;


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
            players[index].nazwa_uz=msg.user;
            players[index].cards=[];
            client.broadcast.emit("message","Player " + players[index].nazwa_uz + " joined.");
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
            client.emit("message","You are ready!");
            client.broadcast.emit("message","Player " + players[index].nazwa_uz + " is ready!");
            if(allReady === true){
            client.emit("message","ALL READY!");
            client.broadcast.emit("message","ALL READY!");
            var j = 5;
                 var interval=setInterval(function(){
                    client.emit("message","Game starts in ..." + j);
                    client.broadcast.emit("message","Game starts in ..." + j);
                    j-=1;
                    if(j<1){
                        clearInterval(interval);
                        pop_deck_shuffle();
                        rozdaj([0,1,2],2);
                        round=1;
                        players[0].emit("start_game",{cards:players[0].cards,cards_table:table_cards});
                        players[1].emit("start_game",{cards:players[1].cards,cards_table:table_cards});
                        players[2].emit("start_game",{cards:players[2].cards,cards_table:table_cards});
                        };
                    },1000);   
            };
    });

    client.on("game_round2", function (){
        rozdaj([0,1,2],1);
        round+=1;
        players[0].emit("game_round2",{cards:players[0].cards,cards_table:table_cards,round:round});
        players[1].emit("game_round2",{cards:players[1].cards,cards_table:table_cards,round:round});
        players[2].emit("game_round2",{cards:players[2].cards,cards_table:table_cards,round:round});

    });
    client.on('disconnect', function() {
        var i;
        var index;
        for(i=0;i<players.length;i+=1){
                if(client===players[i]){
                index=i;
                };
            };
        if(players.length>0){
        client.broadcast.emit("message","Player " + players[index].nazwa_uz + " left.");
        players.splice(index,1); 
        client.broadcast.emit("player_nr","Players:"+players.length);
        };
    });
});

function pop_deck_shuffle(){
    card_deck=[];
    var i;
    for (i=1;i<53;i+=1){
        card_deck.push(i);
    };
    shuffleArray(card_deck);
};
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};
function rozdaj (players_active,ilosc){
    var i,j;
    for(i=0;i<ilosc;i+=1){
        for(j=0;j<players_active.length;j+=1){
            players[players_active[j]].cards.push(card_deck.pop());
        };
        table_cards.push(card_deck.pop());
    };

};