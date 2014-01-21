/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
    'use strict';
    var socket; 

    var join_button = document.getElementById("join_button");

    var ready_string = "<br/><br/><table><tr><td><p id=\"ready_state\"></td><td><input id=\"ready_button\" type=\"button\" value=\"Ready\"></td></tr></table> ";

    var game_string = "<table><tr id=\"row1\"></tr><tr id=\"row2\"></tr></table><input id=\"check_button\" type=\"button\" value=\"Check\"><input id=\"fold_button\" type=\"button\" value=\"Fold\">";

    var player_turn=0;

    join_button.addEventListener("click",function (){
            socket = io.connect('http://localhost:3000');

            socket.on('message', function (msg) {
               $('#log ul').append('<li>' + msg + '</li>');
               $("#log").animate({ scrollTop: $('#log')[0].scrollHeight}, 1000);
            });

            

            socket.on('player_nr', function (msg) {
               $('#player_nr').html(msg);
            });

            socket.emit("join",{user:document.getElementById("text").value});
            $("#game").html(ready_string);

            $("#ready_state").html("Not ready");
            
            var ready_button = document.getElementById("ready_button");
            ready_button.addEventListener("click", function (){
                 $("#ready_state").html("Ready");
                 ready_button.disabled=true;
                 socket.emit("ready",{my:'data'});
            });

            socket.on("start_game", function (msg){
                $("#game").html(game_string);
				$("#row1").append("<td>"  +  "<img src=\"cards/"+msg.cards_table[0] +".svg\" alt=\"Smiley face\" height=\"150\" width=\"100\"></td>");
                $("#row2").append("<td>"  +  "<img src=\"cards/"+msg.cards[0] +".svg\" alt=\"Smiley face\" height=\"150\" width=\"100\"></td>");
				$("#row1").append("<td>"  +  "<img src=\"cards/"+msg.cards_table[1] +".svg\" alt=\"Smiley face\" height=\"150\" width=\"100\"></td>");
                $("#row2").append("<td>"  +  "<img src=\"cards/"+msg.cards[1] +".svg\" alt=\"Smiley face\" height=\"150\" width=\"100\"></td>");
                $("#row1").append("<td>"  +  "<img src=\"cards/"+msg.cards_table[2] +".svg\" alt=\"Smiley face\" height=\"150\" width=\"100\"></td>");
                 var check_button = document.getElementById("check_button");
                 var fold_button = document.getElementById("fold_button");
                 check_button.addEventListener("click", function (){
                    socket.emit("check",{player:player_turn});
                    check_button.disabled=true;
                    fold_button.disabled=true;
                 });
                fold_button.addEventListener("click", function (){
                    socket.emit("fold",{player:player_turn});
                    check_button.disabled=true;
                    fold_button.disabled=true;
                 });
                check_button.disabled=true;
                fold_button.disabled=true;

            });
            socket.on("folded", function (){
                socket.emit("fold",{player:player_turn});
            });
            socket.on("end", function (){
                $("#check_button").remove();
                $("#fold_button").remove();
                $("#game").append("<input id=\"next_button\" type=\"button\" value=\"Next round\">");
                var next_button = document.getElementById("next_button");
                next_button.addEventListener("click", function (){
                    socket.emit("ready",{my:'data'});
                    next_button.disabled=true;
                });
            });
            socket.on("your_turn", function (msg){
                 var check_button = document.getElementById("check_button");
                 var fold_button = document.getElementById("fold_button");
                 check_button.disabled=false;
                 fold_button.disabled=false;
                 player_turn=msg.player;
            });
            socket.on("next_round", function (){
                socket.emit("game_round2", {});
                player_turn=0;
            });
            socket.on("game_round2", function (msg){
                if(msg.round===2){
                    $("#row1").append("<td>"  +  "<img src=\"cards/"+msg.cards_table[3] +".svg\" alt=\"Smiley face\" height=\"150\" width=\"100\"></td>");
                };
                if(msg.round===3){
                    $("#row1").append("<td>" +  "<img src=\"cards/"+msg.cards_table[4] +".svg\" alt=\"Smiley face\" height=\"150\" width=\"100\"></td>");
                };
                $("#log").animate({ scrollTop: $('#log')[0].scrollHeight}, 1000);

            });


        
    });

    
});
