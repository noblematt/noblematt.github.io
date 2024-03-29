
const DEFAULT_BLINDS = `
30: 5 / 5; 5 / 10;
10: break;
15: 10 / 15; 10 / 20; 10: 15 / 25; 15 / 30; 20 / 40;
10: break;
10: 25 / 50; 50 / 75; 50 / 100; 75 / 125; 75 / 150; 100 / 200;
10: break;
10: 125 / 250; 150 / 300; 200 / 400; 250 / 500; 300 / 600; 400 / 800;
10: break;
10: 500 / 1000; 600 / 1200; 800 / 1600; 1000 / 2000; 1200 / 2400; 1500 / 3000;
10: break;
10: 2000 / 4000; 2500 / 5000; 3000 / 6000; 4000 / 8000; 5000 / 10000; 6000 / 12000;
`.trim()

const SEATING_CHART_COL_WIDTHS = [12, 6, 4, 6, 4, 4];

const TICK_INTERVAL = 200;

function read_buy_in() {
    game_state.buy_in = document.getElementById("buy-in-input").value;
    recalculate_prize_pool();
}

function read_starting_stack() {
    game_state.starting_stack = document.getElementById("starting-stack-input").value;
    recalculate_chip_count();
}

function read_blinds() {
    game_state.blinds = document.getElementById("blinds-input").value;
    update();
}

function read_players_per_table() {
    game_state.players_per_table = document.getElementById("players-per-table-input").value;
    update();
}

function recalculate_prize_pool() {
    game_state.prize_pool = game_state.buy_in * game_state.n_buy_ins;
    update();
}

function recalculate_chip_count() {
    game_state.chip_count = game_state.starting_stack * game_state.n_buy_ins;
    update();
}

function add_player(name) {
    // If no name is provided, retrieve from form input
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
    game_state.players_remaining++;
    game_state.n_buy_ins++;
    recalculate_chip_count();
    recalculate_prize_pool();
    update();
}

function assign_seats() {
    var n_tables = Math.ceil(game_state.players.length / game_state.players_per_table);
    var players = [...game_state.players];
    var tables = [];
    for (var i=0; i<n_tables; i++) {
        tables.push([[], []]);
        for (var j=0; j<game_state.players_per_table; j++) {
            tables[i][0].push(j);
        }
    }
    var i = 0;
    while (players.length) {
        var seat_index = Math.floor(Math.random() * tables[i][0].length);
        var player_index = Math.floor(Math.random() * players.length);
        var seat_number = tables[i][0].splice(seat_index, 1)[0];
        var player = players.splice(player_index, 1)[0];
        tables[i][1][seat_number] = player;
        i = (i + 1) % n_tables;
    }
    game_state.seating = tables;
    document.getElementById("setup-container").classList.add("hidden");
    document.getElementById("seating-container").classList.remove("hidden");
    update();
}

function start_game() {
    game_state.levels = build_blinds(game_state.blinds);
    delete game_state.blinds;
    game_state.level = -1;
    game_state.minutes = 0;
    game_state.seconds = 0;
    set_level_end();
    game_state.started = true;
    game_state.running = true;

    document.getElementById("seating-container").classList.add("hidden");
    document.getElementById("clock-container").classList.remove("hidden");
    tick();
}

function build_blinds(blinds_definition) {
    var level_definitions = blinds_definition.split(';');
    var level_time = 0;
    levels = [];
    for (var i in level_definitions) {
        var definition = level_definitions[i].trim();
        if (definition.length == 0) {
            continue;
        }
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
    window.setTimeout(tick, TICK_INTERVAL);
    var now = new Date().getTime();
    if (now >= game_state.level_end) {
        game_state.level++;
        if (game_state.level == game_state.levels.length) {
            game_state.level--;
        }
        game_state.seconds = 0;
        game_state.minutes = game_state.levels[game_state.level][0]
        set_level_end();
        if (game_state.levels[game_state.level][1] == 'break') {
            pause();
        } else {
            game_state.minutes--;
            game_state.seconds = 59;
        }
    } else {
        var time_remaining = game_state.level_end - now;
        game_state.seconds = Math.floor((time_remaining / 1000) % 60);
        game_state.minutes = Math.floor((time_remaining / 1000) / 60);
        if (game_state.seconds < 10 && !game_state.minutes) {
            if (game_state.seconds % 2) {
                document.body.style.backgroundColor = 'red';
            } else {
                document.body.style.backgroundColor = 'white';
            }
        }
    }
    update();
}

function eliminate_player() {
    game_state.players_remaining--;
    update();
}

function pause() {
    game_state.running = false;
    update();
}

function unpause() {
    game_state.running = true;
    set_level_end();
    window.setTimeout(tick, TICK_INTERVAL);
    update();
}

function set_level_end() {
    game_state.level_end = new Date().getTime() + 1000 * (game_state.seconds + 60 * game_state.minutes);
}

function end_level() {
    game_state.level_end = new Date().getTime();
}

function update() {
    if (game_state.started) {
        update_players_remaining_label();
        update_average_stack_label();
        update_clock_labels();
        update_blinds_labels();
        update_prizes_label();
    } else if (game_state.seating) {
        update_seating_chart();
    } else {
        update_players_entered_labels();
        update_prize_pool_label();
    }
    update_url();
}

function update_seating_chart() {
    var html = '';
    var col_width = SEATING_CHART_COL_WIDTHS[game_state.seating.length - 1] || 3;
    for (var i=0; i<game_state.seating.length; i++) {
        html += '<div class="col-md-' + col_width + '"><h2>Table ' + (i + 1) + '</h2><ul>';
        for (var j=0; j<game_state.seating[i][1].length; j++) {
            html += '<li><strong>Seat ' + (j + 1) + ':</strong> ';
            if (game_state.seating[i][1][j]) {
                html += game_state.seating[i][1][j];
            }
        }
        html += '</ul></div>';
    }
    document.getElementById("seating-chart").innerHTML = html;
};

function update_players_entered_labels() {
    var html = '';
    for (var i in game_state.players) {
        html += '<li>' + game_state.players[i] + '</li>';
    }
    document.getElementById("player-list").innerHTML = html;
    document.getElementById("player-count-label").innerHTML = game_state.players.length;
    if (game_state.players.length > 1) {
        document.getElementById("assign-seats-btn").disabled = false;
    }
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

function update_prize_pool_label() {
    document.getElementById("prize-pool-label").innerHTML = game_state.prize_pool;
}

function update_prizes_label() {
    var prizes = calculate_prizes();
    var label = '';
    for (var i=0; i<prizes.length; i++) {
        var prize = prizes[i];
        if (i > 0) {
            label += " / ";
        }
        label += "£" + prize;
    }
    document.getElementById("prizes-label").innerHTML = label;
}

function initialise() {
    document.getElementById("blinds-input").value = DEFAULT_BLINDS;

    var encoded_data = location.hash.substr(1);
    if (encoded_data.length == 0) {
        // If no data is provided, we should initialise these from the form inputs
        read_buy_in();
        read_starting_stack();
        read_blinds();
        read_players_per_table();
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

function open_related(name) {
    window.open(window.location.toString().replace('clock', name), '_blank');
}

function restore_state(data) {
    for (var key in data) {
        game_state[key] = data[key];
    }
    update();
    if (game_state.started) {
        document.getElementById("setup-container").classList.add("hidden");
        document.getElementById("clock-container").classList.remove("hidden");
        if (game_state.running) {
            tick();
        }
    } else if (game_state.seating) {
        document.getElementById("setup-container").classList.add("hidden");
        document.getElementById("seating-container").classList.remove("hidden");
    } else {
        document.getElementById("buy-in-input").value = game_state.buy_in;
        document.getElementById("starting-stack-input").value = game_state.starting_stack;
        document.getElementById("blinds-input").value = game_state.blinds;
        document.getElementById("players-per-table-input").value = game_state.players_per_table;
    }
}

document.addEventListener('DOMContentLoaded', initialise);
