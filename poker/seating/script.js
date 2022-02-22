
const MAX_N_TABLES = 20;

function move(table, seat) {
    game_state.moving_player = game_state.seating[table][1][seat];
    remove_from_seat(table, seat);
    update();
}

function add(table, seat) {
    var input = document.getElementById("input-" + table + "-" + seat);
    var name = input.value.trim();
    input.value = '';
    if (name.length == 0) {
        alert("Cannot add player with no name");
        return;
    }
    game_state.seating[table][1][seat] = name;
    update();
}

function eliminate(table, seat) {
    remove_from_seat(table, seat);
    update();
}

function move_to(table, seat) {
    game_state.seating[table][1][seat] = game_state.moving_player;
    game_state.moving_player = undefined;
    update();
}

function remove_from_seat(table, seat) {
    game_state.seating[table][1][seat] = undefined;
    for (var i in game_state.seating[table][1]) {
        if (game_state.seating[table][1][i]) {
            return;
        }
    }
    game_state.seating.splice(table, 1);
}

function add_table() {
    game_state.seating.push([[], []]);
    update();
}

function initialise() {
    var encoded_data = location.hash.substr(1);
    if (encoded_data.length == 0) {
        alert("Please use this resource with data encoded in hash string");
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
                populate(data);
            });
        };
        reader.readAsArrayBuffer(blob);
    });
}

function populate(data) {
    for (var key in data) {
        game_state[key] = data[key];
    }

    var html = '';
    for (var i=0; i<MAX_N_TABLES; i++) {
        html += '<div id="table-' + i + '" class="col-md-4 hidden">';
        html += '<table class="table seating-chart-table">';
        html += '<thead><tr><th colspan="4">Table ' + (i + 1) + '</th></tr></thead><tbody>';
        for (var j=0; j<game_state.players_per_table; j++) {
            html += '<tr id="row-seat-' + i + '-' + j + '"><td><strong>' + (j + 1) + '</strong></td>';
            html += '<td><span id="label-' + i + '-' + j + '"></span>';
            html += '<input type="text" id="input-' + i + '-' + j + '" class="hidden" size="10" /></td>';
            html += '<td><button type="button" id="move-' + i + '-' + j + '" onclick="move(' + i + ', ' + j + ')">Move</button>';
            html += '<button type="button" id="add-' + i + '-' + j + '" onclick="add(' + i + ', ' + j + ')">Add</button></td>';
            html += '<td><button type="button" id="eliminate-' + i + '-' + j + '" onclick="eliminate(' + i + ', ' + j + ')">Eliminate</button></td></tr>';
            html += '<tr id="row-move-to-' + i + '-' + j + '" class="hidden"><td><strong>' + (j + 1) + '</strong></td>';
            html += '<td colspan="3"><button type="button" id="btn-move-to-' + i + '-' + j + '" class="btn btn-primary"';
            html += 'onclick="move_to(' + i + ', ' + j + ')">Move here</button></td></tr>'; 
        }
        html += '</tbody></table></div>';
    }
    document.getElementById("seating-row").innerHTML = html;
    update();
}

function update() {
    for (var i=0; i<MAX_N_TABLES; i++) {
        if (i < game_state.seating.length) {
            document.getElementById("table-" + i).classList.remove('hidden');
        } else {
            document.getElementById("table-" + i).classList.add('hidden');
        }

        for (var j=0; j<game_state.players_per_table; j++) {
            var input = document.getElementById('input-' + i + '-' + j);
            var label = document.getElementById('label-' + i + '-' + j);
            var move = document.getElementById('move-' + i + '-' + j);
            var add = document.getElementById('add-' + i + '-' + j);
            var eliminate = document.getElementById('eliminate-' + i + '-' + j);
            var btn_move_to = document.getElementById('btn-move-to-' + i + '-' + j);
            var row_move_to = document.getElementById('row-move-to-' + i + '-' + j);
            var row_seat = document.getElementById('row-seat-' + i + '-' + j);

            if (i < game_state.seating.length && game_state.seating[i][1][j]) {
                input.classList = "hidden";
                add.classList = "hidden";
                move.classList = "btn btn-info";
                eliminate.classList = "btn btn-danger";
                if (game_state.moving_player) {
                    move.disabled = true;
                    eliminate.disabled = true;
                } else {
                    move.disabled = false;
                    eliminate.disabled = false;
                }
                row_move_to.classList = "hidden";
                row_seat.classList = "";
                label.innerHTML = game_state.seating[i][1][j];
            } else {
                if (game_state.moving_player) {
                    row_move_to.classList = "";
                    row_seat.classList = "hidden";
                    btn_move_to.innerHTML = "Move " + game_state.moving_player + " here";
                } else {
                    row_move_to.classList = "hidden";
                    row_seat.classList = "";
                    input.classList = "";
                    add.classList = "btn btn-success";
                    move.classList = "hidden";
                    eliminate.classList = "hidden";
                    label.innerHTML = "";
                }
            }
        }
    }
    update_url();
}

document.addEventListener('DOMContentLoaded', initialise);
