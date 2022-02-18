
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
    document.getElementById("date-label").innerHTML = build_date_string();
    for (var key in data) {
        game_state[key] = data[key];
    }
    for (var i in game_state.players) {
        var row = '<tr><td>' + game_state.players[i] + '</td>';
        row += '<td>£' + game_state.buy_in + '</td></tr>';
        document.getElementById("buy-ins-table").innerHTML += row;
    }
    var prizes = calculate_prizes();
    var points = calculate_league_points();
    for (var i=0; i<points.length; i++) {
        var row = '<tr><td>' + add_th(i + 1) + '</td>';
        row += '<td><input id="player-' + i + '-input" type="text" value="';
        if (game_state.results[i]) {
            row += game_state.results[i];
        }
        row += '" oninput="read_results()" /></td><td>';
        var prize = prizes[i];
        if (prize) {
            row += '£' + prize;
        }
        row += '</td><td>' + points[i] + '</td></tr>';
        document.getElementById("results-table").innerHTML += row;
    }
}

function read_results() {
    for (var i in game_state.players) {
        game_state.results[i] = document.getElementById('player-' + i + '-input').value;
    }
    update_url();
}

document.addEventListener('DOMContentLoaded', initialise);
