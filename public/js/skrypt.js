/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
    'use strict';
    var socket; 

    var join_button = document.getElementById("join_button");

    var ready_string = "<br/><br/><table><tr><td><p id=\"ready_state\"></td><td><input id=\"ready_button\" type=\"button\" value=\"Ready\"></td></tr></table> ";

    var game_string = "<table><tr id=\"row1\"></tr><tr id=\"row2\"></tr></table><input id=\"check_button\" type=\"button\" value=\"Check\"><input id=\"fold_button\" type=\"button\" value=\"Fold\"><input id=\"raise_text\"><input id=\"raise_button\" type=\"button\" value=\"Raise\">";

    var game_in_progress=0;

    var player_turn=0;

    join_button.addEventListener("click",function (event){
            socket = io.connect('192.168.0.104:3000');

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
            ready_button.addEventListener("click", function (event){
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
                 var raise_button = document.getElementById("raise_button");
                 var raise_text = document.getElementById("raise_text");
                 check_button.addEventListener("click", function (event){
                    socket.emit("check",{player:player_turn});
                    check_button.disabled=true;
                    fold_button.disabled=true;
                    raise_button.disabled=true;
                    raise_text.disabled=true;
                 });
                fold_button.addEventListener("click", function (event){
                    socket.emit("game_round2",{});
                    check_button.disabled=true;
                    fold_button.disabled=true;
                    raise_button.disabled=true;
                    raise_text.disabled=true;
                 });
                raise_button.addEventListener("click", function (event){
                    socket.emit("game_round2",{});
                    check_button.disabled=true;
                    fold_button.disabled=true;
                    raise_button.disabled=true;
                    raise_text.disabled=true;
                 });
                check_button.disabled=true;
                fold_button.disabled=true;
                raise_button.disabled=true;
                raise_text.disabled=true;

            });
            socket.on("your_turn", function (msg){
                 var check_button = document.getElementById("check_button");
                 var fold_button = document.getElementById("fold_button");
                 var raise_button = document.getElementById("raise_button");
                 var raise_text = document.getElementById("raise_text");
                 check_button.disabled=false;
                 fold_button.disabled=false;
                 raise_button.disabled=false;
                 raise_text.disabled=false;
                 player_turn=msg.player;
            });
            socket.on("next_round", function (msg){
                socket.emit("game_round2", {});
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
