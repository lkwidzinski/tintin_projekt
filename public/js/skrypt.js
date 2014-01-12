/*jshint node: true, browser: true, jquery: true */
/*global io: false */
$(document).ready(function () {
    'use strict';
    var socket; 

    var join_button = document.getElementById("join_button");

    var game_string = "<table><tr><td><p id=\"ready_state\"></td><td><input id=\"ready_button\" type=\"button\" value=\"Ready\"></td></tr></table> ";

    join_button.addEventListener("click",function (event){
            socket = io.connect('192.168.0.104:3000');

            socket.on('message', function (msg) {
               $('#log ul').append('<li>' + msg + '</li>');
            });

            socket.on('player_nr', function (msg) {
               $('#player_nr').html(msg);
            });

            socket.emit("join",{my:'data'});
            $("#game").html(game_string);

            $("#ready_state").html("Not ready");
            
            var ready_button = document.getElementById("ready_button");
            ready_button.addEventListener("click", function (event){
                 $("#ready_state").html("Ready");
                 ready_button.disabled=true;
            socket.emit("ready",{my:'data'});
            });

        
    });

    
});
