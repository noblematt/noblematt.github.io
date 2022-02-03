
var lzma = new LZMA("/lib/lzma_worker.js");

function initialise() {
    var html = ''
    users = extract_users();
    for (var i in users) {
        html += '<option>' + users[i] + '</option>';
    }
    var selector = document.getElementById("username-selector");
    selector.innerHTML = html;
    selector.value = users[0];
}

function update() {
    var username = document.getElementById("username-selector").value;
    var target = document.getElementById("target-range").value;
    document.getElementById("target-label").textContent = "Target position: " + target
    update_points(username, target);
}

function extract_users() {
    users = []
    for (var i in DATA['daily-leaderboards']) {
        for (var j in DATA['daily-leaderboards'][i]) {
            for (var k in DATA['daily-leaderboards'][i][j]) {
                var user = DATA['daily-leaderboards'][i][j][k];
                if (!users.includes(user)) {
                    users.push(user)
                }
            }
        }
    }
    users.sort();
    return users;
}

function update_points(username, target) {
    leaderboard = {};
    user_points = [];
    target_points = [];
    for (var i in DATA['daily-leaderboards']) {
        for (var j in DATA['daily-leaderboards'][i]) {
            for (var k in DATA['daily-leaderboards'][i][j]) {
                var u = DATA['daily-leaderboards'][i][j][k];
                leaderboard[u] = (leaderboard[u] || 0) + (100 - k);
            }
            user_points.push(leaderboard[username] || 0);
            target_points.push(sorted(leaderboard)[target-1][0])
        }
    }
    document.getElementById("user-points-label").textContent = username + " points: " + leaderboard[username];
    var target_entry = sorted(leaderboard)[target-1];
    document.getElementById("target-points-label").textContent = add_th(target) + " (" + target_entry[1] + ") points: " + target_entry[0];
    var lines = {username: user_points};
    lines[add_th(target)] = target_points;
    document.getElementById("points-graph").innerHTML = build_graph("Points", lines);
}

function build_graph(y_axis_label, lines) {
    var html = '<line x1="50" y1="10" x2="50" y2="550" class="axis" />';
    html += '<line x1="50" y1="550" x2="950" y2="550" class="axis" />';

    var values = [];
    var max_x;
    for (var key in lines) {
        values = values.concat(lines[key]);
        max_x = lines[key].length + 1;
    }
    var max_y = Math.max(...values);
    var steps = [25000, 5000, 1000, 400, 200, 100, 50, 10, 5, 2, 1];
    var step_y = 0;
    var step_x = 0;
    for (var i in steps) {
        step_y = steps[i]
        if (step_y * 3 < max_y) {
            break
        }
    }
    for (var i in steps) {
        step_x = steps[i]
        if (step_x * 3 < max_x / 2) {
            break
        }
    }
    for (var i = step_y; i < max_y; i += step_y) {
        var y = 550 - (540 * i / max_y);
        html += '<line x1="45" y1="' + y + '" x2="50" y2="' + y + '" class="axis" />';
        html += '<text x="20" y="' + (y + 4) + '" class="axis-label">' + i + '</text>';
    }
    for (var i = step_x; i < max_x / 2; i += step_x) {
        var x = (1900 * i / max_x);
        html += '<line x1="' + x + '" y1="550" x2="' + x + '" y2="555" class="axis" />';
        html += '<text x="' + (x - 3) + '" y="565" class="axis-label">' + i + '</text>';
    }
    html += '<text x="0" y="275" transform="rotate(90 0,275)">Points</text>';
    html += '<text x="480" y="580">Days</text>';
    var i = 0;

    for (var key in lines) {
        var line = lines[key];
        var prev_x = 50;
        var prev_y = 550;
        for (var i=0; i<line.length; i++) {
            var x = 50 + (i + 1) * 900 / max_x;
            var y = 550 - 540 * line[i] / max_y;
            html += '<line x1="' + prev_x + '" y1="' + prev_y + '" ';
            html += 'x2="' + x + '" y2="' + y + '" ';
            html += 'class="graph-line title="' + key + '" />';
            prev_x = x;
            prev_y = y;
        }
    }
    return html;
}

function sorted(map) {
    var list = [];
    for (key in map) {
        list.push([map[key], key]);
    }
    list.sort(function(a, b) { return b[0] - a[0]; });
    return list;
}

function add_th(number) {
    var postfix = "th";
    if (number % 10 == 1 && number % 100 != 11) {
        postfix = "st";
    }
    if (number % 10 == 2 && number % 100 != 12) {
        postfix = "nd";
    }
    if (number % 10 == 3 && number % 100 != 13) {
        postfix = "rd";
    }
    return number + postfix;
}

document.addEventListener('DOMContentLoaded', function() {
    initialise();
    update();
});
