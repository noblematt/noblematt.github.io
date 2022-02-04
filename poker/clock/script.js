
var lzma = new LZMA("/lib/lzma_worker.js");

DEFAULT_BLINDS = `
30: 5 / 5; 5 / 10;
20: 10 / 15; 10 / 20; 15 / 25;
15: 15 / 30; 20 / 40; 25 / 50; 30 / 60;
10: 40 / 80; 50 / 100; 60 / 120; 80 / 160; 100 / 200; 125 / 250;
10: 150 / 300; 200 / 400; 250 / 500; 300 / 600; 400 / 800; 500 / 1000;
10: 600 / 1200; 800 / 1600; 1000 / 2000; 1200 / 2400; 1500 / 3000; 2000 / 4000;
`.trim()

game_state = {
    "players": [],
    "players_remaining": 0
}

function update_prize_pool() {
    game_state.buy_in = document.getElementById("buy-in-input").value;
    game_state.prize_pool = game_state.buy_in * game_state.players.length;
    document.getElementById("prize-pool-label").innerHTML = game_state.prize_pool;
    update_prizes_label();
    update_url();
}

function update_chip_count() {
    game_state.starting_stack = document.getElementById("starting-stack-input").value;
    game_state.chip_count = game_state.starting_stack * game_state.players.length;
    update_average_stack_label();
    update_url();
}

function add_player(name) {
    if (!name) {
        var input = document.getElementById("player-name-input");
        name = input.value;
        input.value = '';
    }
    name = name.trim();
    if (!name) {
        alert("No name provided; not adding new player");
        return;
    }
    game_state.players.push(name);
    game_state.players_remaining += 1;
    update_chip_count();
    update_prize_pool();
    document.getElementById("player-list").innerHTML += "<li>" + name + "</li>";
    document.getElementById("player-count-label").innerHTML = game_state.players.length;
    if (game_state.players.length > 1) {
        document.getElementById("start-game-btn").disabled = false;
    }
    update_players_remaining_label();
    update_url();
}

function start_game() {
    game_state.levels = build_blinds();
    game_state.level = -1;
    game_state.minutes = 0;
    game_state.seconds = 0;
    game_state.started = true;
    game_state.running = true;

    update_players_remaining_label();
    update_average_stack_label();

    document.getElementById("setup-container").classList.add("hidden");
    document.getElementById("clock-container").classList.remove("hidden");
    tick();
}

function build_blinds() {
    var level_definitions = document.getElementById("blinds-input").value.split(';');
    var level_time = 0;
    levels = [];
    for (var i in level_definitions) {
        var definition = level_definitions[i];
        var parts = definition.split(':');
        if (parts.length > 1) {
            level_time = parseInt(parts[0]);
        }
        var blinds = parts[parts.length - 1].trim();
        levels.push([level_time, blinds]);
    }
    return levels;
}

function tick() {
    if (!game_state.running) {
        return;
    }
    window.setTimeout(tick, 1000);
    if (game_state.seconds) {
        game_state.seconds -= 1;
    } else if (game_state.minutes) {
            game_state.minutes -= 1;
            game_state.seconds = 59;
    } else {
        game_state.level += 1;
        if (game_state.level == game_state.levels.length) {
            game_state.level -= 1;
        }
        game_state.minutes = game_state.levels[game_state.level][0]
        update_blinds_labels();
    }
    update_clock_labels();
    update_url();
}

function eliminate_player() {
    game_state.players_remaining -= 1;
    update_players_remaining_label();
    update_average_stack_label();
    update_url();
}

function pause() {
    game_state.running = false;
    update_url();
}

function unpause() {
    game_state.running = true;
    window.setTimeout(tick, 1000);
    update_url();
}

function update_players_remaining_label() {
    document.getElementById("players-remaining-label").innerHTML = game_state.players_remaining;
}

function update_average_stack_label() {
    document.getElementById("average-stack-label").innerHTML = Math.round(game_state.chip_count / game_state.players_remaining);
}

function update_clock_labels() {
    document.getElementById("minutes-label").innerHTML = pad(game_state.minutes);
    document.getElementById("seconds-label").innerHTML = pad(game_state.seconds);
}

function update_blinds_labels() {
    document.getElementById("current-blinds-label").innerHTML = game_state.levels[game_state.level][1];
    var next_level = game_state.level + 1;
    if (next_level == game_state.levels.length) {
        next_level -= 1;
    }
    document.getElementById("next-blinds-label").innerHTML = game_state.levels[next_level][1];
}

PRIZE_DISTS = [
    [1, [100]],
    [5, [70, 30]],
    [11, [50, 30, 20]],
    [21, [37, 25, 15, 12, 11]],
    [31, [35, 22, 15, 11, 9, 8]],
    [41, [32, 18, 12.5, 10.5, 8.3, 7.3, 6.2, 5.2]]
];

function update_prizes_label() {
    var prize_pool = game_state.prize_pool;
    var n_players = game_state.players.length;
    var dist;
    for (var i in PRIZE_DISTS) {
        if (PRIZE_DISTS[i][0] <= n_players) {
            dist = PRIZE_DISTS[i][1]
        }
    }
    var pool_remaining = prize_pool;
    var prizes = [];
    for (var i = dist.length - 1; i>=0; i--) {
        console.log(i, dist, dist.length);
        var value = Math.round(dist[i] * prize_pool / 100);
        if (i == 0) {
            value = pool_remaining;
        }
        prizes.unshift(value);
        pool_remaining -= value;
    }
    var label = '';
    for (var i=0; i<prizes.length; i++) {
        var prize = prizes[i];
        if (i > 0) {
            label += " / ";
        }
        label += "£" + prize;
    }
    console.log(dist, prizes, label);
    document.getElementById("prizes-label").innerHTML = label;
}

function pad(n, length=2) {
    n = n.toString();
    while (n.length < length) {
        n = '0' + n;
    }
    return n;
}

function initialise() {
    document.getElementById("blinds-input").value = DEFAULT_BLINDS;

    var encoded_data = location.hash.substr(1);
    if (encoded_data.length == 0) {
        return;
    }

    if (!fetch) {
        alert("Hash string decoding not supported on this browser");
        return;
    }

    fetch("data:application/octet-stream;base64," + encoded_data).then(r => r.blob()).then(function(blob){
        var reader = new FileReader();
        reader.onload = function(){
            var compressed_data = Array.from(new Uint8Array(reader.result));
            lzma.decompress(compressed_data, function(data, error) {
                if (error) {
                    alert("Failed to decompress data: " + error);
                    return;
                }

                data = JSON.parse(data);
                restore_state(data);
            });
        };
        reader.readAsArrayBuffer(blob);
    });
}

function restore_state(data) {
    for (var key in data) {
        game_state[key] = data[key];
    }
    if (game_state.buy_in) {
        document.getElementById('buy-in-input').value = game_state.buy_in;
    }
    if (game_state.starting_stack) {
        document.getElementById('starting-stack-input').value = game_state.starting_stack;
    }
    update_prize_pool();
    update_chip_count();
    var player_list = document.getElementById("player-list");
    for (var i in game_state.players) {
        player_list.innerHTML += "<li>" + game_state.players[i] + "</li>";
    }
    document.getElementById("player-count-label").innerHTML = game_state.players.length;
    if (game_state.players.length > 1) {
        document.getElementById("start-game-btn").disabled = false;
    }
    if (game_state.started) {
        update_players_remaining_label();
        update_average_stack_label();
        update_blinds_labels();
        update_prizes_label();
        update_clock_labels();

        document.getElementById("setup-container").classList.add("hidden");
        document.getElementById("clock-container").classList.remove("hidden");
        if (game_state.running) {
            tick();
        }
    }
}

function update_url() {
    lzma.compress(JSON.stringify(game_state), 1, function(compressed, error) {
        if (error) {
            alert("Failed to compress data: "+error);
            return;
        }

        var reader = new FileReader();
        reader.onload = function(){
            var encoded_data = reader.result.substr(reader.result.indexOf(",")+1);
            var url = '#' + encoded_data;
            window.location.replace(url);
        };
        reader.readAsDataURL(new Blob([new Uint8Array(compressed)]));
    });
}

document.addEventListener('DOMContentLoaded', initialise);
