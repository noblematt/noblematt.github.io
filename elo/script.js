
var lzma = new LZMA("/lib/lzma_worker.js");

var game_history = [];

function initialise(data) {
    game_history.push.apply(game_history, data);
    update_rankings();
}

function update_rankings() {
    var rankings = calculate_rankings(game_history);
    render_rankings(rankings);
}

function calculate_rankings(results) {
    rankings = {};
    for (var i in results) {
        var result = results[i];
        var team_rankings = [];
        for (var j in result) {
            var player_list = result[j];
            var ranking_list = [];
            for (var k in player_list) {
                var player = player_list[k];
                if (!(player in rankings)) {
                    rankings[player] = 500;
                }
                ranking_list.push(rankings[player]);
            }
            team_rankings.push(average(ranking_list));
        }
        var delta = calculate_ranking_delta.apply(null, team_rankings);
        for (var j in result) {
            var player_list = result[j];
            for (var k in player_list) {
                var player = player_list[k];
                rankings[player] += delta * (1 - (j * 2))
            }
        }
    }
    return rankings
}

function render_rankings(rankings) {
    var html = '';
    var player_points = sorted(rankings);
    for (var i=0; i<player_points.length; i++) {
        html += '<tr><th>' + (i+1) + '</th>';
        html += '<td>' + player_points[i][0] + '</td>';
        html += '<td>' + player_points[i][1] + '</td></tr>\n';
    }
    document.getElementById('rankings').innerHTML = html;
}

function record_result() {
    var winners = parse_list(document.getElementById('winner').value);
    var losers = parse_list(document.getElementById('loser').value);
    game_history.push([winners, losers]);
    lzma.compress(JSON.stringify(game_history), 1, function(compressed, error) {
        if (error) {
            alert('Failed to compress data: ' + error);
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function () {
            var base64 = reader.result.substr(reader.result.indexOf(',') + 1);
            var url = '#' + base64;
            window.location.replace(url);
        };
        reader.readAsDataURL(new Blob([new Uint8Array(compressed)]));
    });
    update_rankings();
}

function parse_list(string) {
    var players = []
    string.split(',').forEach(player => {
        players.push(player.trim());
    });
    return players;
}

function sorted(map) {
    var list = [];
    for (key in map) {
        list.push([key, map[key]]);
    }
    list.sort(function(a, b) {
        return b[1] - a[1];
    });
    return list;
}

function calculate_ranking_delta(a, b) {
    return Math.round(20 / (1 + Math.pow(10, (a - b) / 400)))
}

function average(values) {
    var total = 0;
    for (var i in values) {
        total += values[i];
    }
    return total / values.length;
}

document.addEventListener('DOMContentLoaded', function(){

    var base64 = location.hash.substr(1);
    if (base64.length == 0) {
        return;
    }

    if (!fetch) {
        alert("Your browser does not support this page.  Sorry! :(");
        return;
    }

    fetch("data:application/octet-stream;base64,"+base64).then(r => r.blob()).then(function(blob){
        var reader = new FileReader();
        reader.onload = function(){
            var compressed_data = Array.from(new Uint8Array(reader.result));
            lzma.decompress(compressed_data, function(data, error) {
                if (error) {
                    alert("Failed to decompress data: "+error);
                    return;
                }

                data = JSON.parse(data);
                initialise(data);
            });
        };
        reader.readAsArrayBuffer(blob);
    });
});
