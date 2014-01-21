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
var player_nr=[];
var modulo_array=[];
var game_in_progress=0;
var player_turn=0;
var player_fold=[];


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
            players[index].punkty = 0;
            players[index].nazwa_uz=msg.user;
            players[index].cards=[];
            players[index].modulo_array=[];
            client.broadcast.emit("message","Player " + players[index].nazwa_uz + " joined.");
            client.emit("message","You joined.");
            client.broadcast.emit("player_nr","Players:" + players.length);
            client.emit("player_nr","Players:" + players.length);
    });
    client.on("ready",function (msg){
            var i;
            game_in_progress=1;
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
                        for(var s=0;s<players.length;s+=1){
                            player_nr.push(s);
                        };
                        pop_deck_shuffle();
                        rozdaj(player_nr,3);
                        player_nr=[];
                        round=1;
                        var k;
                        for(k=0;k<players.length;k+=1){

                            players[k].emit("start_game",{cards:players[k].cards,cards_table:table_cards});
                            
                        };
                        players[player_turn].emit("your_turn",{player:player_turn});
                        };
                    },1000);   
            };
    });

    client.on("check", function (msg){
        player_nr.push(msg.player);
        var i;
        player_turn+=1;
        if(player_turn>players.length-1){
            players[0].emit("next_round",{});
            player_turn=0;
            players[player_turn].emit("your_turn",{player:player_turn});
        }else{
            for(i=0;i<player_fold.length;i+=1){ if (player_fold[i]===player_turn){client.emit("folded",{});return}};
        players[player_turn].emit("your_turn",{player:player_turn});
        };
    });

    client.on("fold", function (msg){
        player_fold.push(msg.player);
        var i;
        player_turn+=1;
        if(player_turn>players.length-1){
            players[0].emit("next_round",{});
            player_turn=0;
            players[player_turn].emit("your_turn",{player:player_turn});
        }else{
            for(i=0;i<player_fold.length;i+=1){ if (player_fold[i]===player_turn){client.emit("folded",{});return}};
        players[player_turn].emit("your_turn",{player:player_turn});
        };
    });

    client.on("game_round2", function (msg){
        round+=1;
        var k;
        if(round<4){
        rozdaj(player_nr,1);
            for(k=0;k<player_nr.length;k+=1){

                 players[player_nr[k]].emit("game_round2",{cards:players[player_nr[k]].cards,cards_table:table_cards,round:round});
                            
            };
        };
        if(round===4){
            var i,tab=[];
            for(i=0;i<player_nr.length;i+=1){
                 check_cards(players[player_nr[i]].cards.concat(table_cards),i);
                 console.log(player_nr.length);
                 client.emit("message","Player " + players[player_nr[i]].nazwa_uz + " had a " + players[player_nr[i]].check_result + " of " + players[player_nr[i]].check_result_nr);
                 client.broadcast.emit("message","Player " + players[player_nr[i]].nazwa_uz + " had a " + players[player_nr[i]].check_result + " of " + players[player_nr[i]].check_result_nr);          

            };
            for(i=0;i<players.length;i+=1){
                players[i].ready = 0;
                players[i].cards=[];
                players[i].modulo_array=[];

            };
            client.broadcast.emit("message","WINNER = " + players[check_winner()].nazwa_uz);
            client.emit("message","WINNER = " + players[check_winner()].nazwa_uz);
            client.broadcast.emit("end",{});
            client.emit("end",{});
            card_deck=[];
            table_cards=[];
            round=0;
            player_nr=[];
            modulo_array=[];
            game_in_progress=0;
            player_turn=0;
            player_fold=[];
        };
        player_nr=[];

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
            if(players.length===0){
                players=[];
                card_deck=[];
                table_cards=[];
                round=0;
                player_nr=[];
                modulo_array=[];
                game_in_progress=0;
                player_turn=0;
                player_fold=[];
            };
        };
    });
});

function pop_deck_shuffle(){
    card_deck=[];
    table_cards=[];
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
    };
    return array;
};
function rozdaj (players_active,ilosc){
    var i,j;
    if(round<4){
        for(i=0;i<ilosc;i+=1){                                     
           for(j=0;j<players_active.length;j+=1){
                if(players[players_active[j]].cards.length<2) {

                players[players_active[j]].cards.push(card_deck.pop());
                };
            };
        table_cards.push(card_deck.pop());
        };
    };

};
function check_cards (cards,player){

    cards.sort(function(a,b){return b-a});
    if(check_for_poker(cards,player)){
        return players[player].rank=1;;
    };
    check_modulo(cards,player);
    if(check_for_four(players[player].modulo_array,player)){
        return players[player].rank=2;
    };
    if(check_for_full(players[player].modulo_array,player)){
        return players[player].rank=3;;
    };
    if(check_for_color(cards,player)){
        return players[player].rank=4;;
    };
	if(check_for_straight(players[player].modulo_array,player)){
		return players[player].rank=5;;
	};
    if(check_for_three(players[player].modulo_array,player)){
        return players[player].rank=6;;
    };
	if(check_for_two_pairs(players[player].modulo_array,player)){
		return players[player].rank=7;;
	};
    if(check_for_pair(players[player].modulo_array,player)){
        return players[player].rank=8;;
    };
	if(check_for_highest (cards,player)){
        return players[player].rank=9;
	};
};

function check_for_poker (cards,player){
    var i;
    for(i=0;i<cards.length-4;i+=1){
        if(cards[i+1]===cards[i]-1&&cards[i+2]===cards[i]-2&&cards[i+3]===cards[i]-3&&cards[i+4]===cards[i]-4){
            players[player].check_result="POKER";
            players[player].check_result_nr=cards[i];
            return true;
        };
    };
    return false;
};

function check_for_four (cards,player){
    var i;
    for(i=cards.length-1;i>=0;i-=1){
        if(cards[i]===4){
            players[player].check_result="FOUR";
            players[player].check_result_nr=i+1;
            return true;
        };
    };
    return false;
};

function check_for_full (cards,player){

    if(check_for_three(cards,player)){
        var i;
        for(i=cards.length-1;i>=0;i-=1){
            if(cards[i]==2){
                players[player].check_result="FULL";
                players[player].check_result_nr+=" " + (i+1);
                return true;
            };
		};
    };
    return false;

};

function check_for_color (cards,player){
    var i;
    var pik=0,karo=0,kier=0,trefl=0;
    for(i=0;i<cards.length;i+=1){
        if(cards[i]<14){
            trefl+=1;
        };
        if(cards[i]<27&&cards[i]>13){
            karo+=1;
        };
        if(cards[i]<40&&cards[i]>26){
            kier+=1;
        };
        if(cards[i]>39){
            pik+=1;
        };
    };
        if(trefl>4||karo>4||kier>4||pik>4){
            players[player].check_result="COLOR";
            players[player].check_result_nr="";
            return true;
        };
    return false;
};

function check_for_straight (cards,player){
    var i;
    for(i=cards.length;i<=4;i-=1){
        if(cards[i]>0&&cards[i-1]>0&&cards[i-2]>0&&cards[i-3]>0&&cards[i-4]>0){
            players[player].check_result="STRAIGHT";
            players[player].check_result_nr=cards[i];
            return true;
        };
    };
    return false;
};

function check_for_three (cards,player){
    var i;
     for(i=cards.length-1;i>=0;i-=1){
        if(cards[i]===3){
            players[player].check_result="THREE";
            players[player].check_result_nr=i+1;
            return true;
        };
    };
    return false;
};

function check_for_two_pairs (cards,player){
        var i,temp=0;
        players[player].check_result_nr="";
        for(i=cards.length-1;i>=0;i-=1){
            if(cards[i]===2){
                temp+=1;
                players[player].check_result_nr+=(i+1)+" ";
                if(temp===2){
                  players[player].check_result="2 PAIRS";
                  return true; 
                };
            };
		};
        
    return false;

};

function check_for_pair (cards,player){
    var i;
    for(i=cards.length-1;i>=0;i-=1){
        if(cards[i]===2){
            players[player].check_result="PAIR";
            players[player].check_result_nr=i+1;
            return true;
        };
    };
    return false;
};

function check_modulo (cards,player){
    var i,j;
    for(j=0;j<13;j+=1){
        players[player].modulo_array.push(0);
    };
    for(i=0;i<cards.length;i+=1){
        if(cards[i]%13===0){
            players[player].modulo_array[12]+=1;
        }else{
            players[player].modulo_array[(cards[i]%13)-1]+=1;
        }; 
    };
};

function check_for_highest (cards,player){
			players[player].check_result="HIGHEST CARD";
            var i;
            for(i=cards.length-1;i>=0;i-=1){
                if(cards[i]===1){
                    players[player].check_result_nr=i+1;
                    return true;
                };
            };
};

function check_winner (){
    var i, winner=0;

    for(i=1;i<players.length;i+=1){
        if(players[i].rank<players[i-1].rank){
            winner=i;
        };
    };
    return winner;
};