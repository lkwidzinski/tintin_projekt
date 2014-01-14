/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
    'use strict';
    var socket; 

    var join_button = document.getElementById("join_button");

    var ready_string = "<table><tr><td><p id=\"ready_state\"></td><td><input id=\"ready_button\" type=\"button\" value=\"Ready\"></td></tr></table> ";

    var game_string = "<table border=\"1\"><tr id=\"row1\"><td id=\"table1\"></td><td id=\"table2\"></td></tr><tr id=\"row2\"><td id=\"player1\"></td><td id=\"player2\"></td></tr></table><input id=\"next_button\" type=\"button\" value=\"Next\">";

    join_button.addEventListener("click",function (event){
            socket = io.connect('192.168.0.104:3000');

            socket.on('message', function (msg) {
               $('#log ul').append('<li>' + msg + '</li>');
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
                $("#player1").html(msg.cards[0]);
                $("#player2").html(msg.cards[1]);
                $("#table1").html(msg.cards_table[0]);
                $("#table2").html(msg.cards_table[1]);
                 var next_button = document.getElementById("next_button");
                 next_button.addEventListener("click", function (event){
                    socket.emit("game_round2",{});
                 });

            });
            socket.on("game_round2", function (msg){
                if(msg.round===2){
                    $("#row1").append("<td>" + msg.cards_table[2] + "</td>");
                    $("#row2").append("<td>" + msg.cards[2] + "</td>");
                };
                if(msg.round===3){
                    $("#row1").append("<td>" + msg.cards_table[3] + "</td>");
                    $("#row2").append("<td>" + msg.cards[3] + "</td>");
                };
                if(msg.round===4){
                    $("#row1").append("<td>" + msg.cards_table[4] + "</td>");
                    $("#row2").append("<td>" + msg.cards[4] + "</td>");
                };

            });

        
    });

    
});
