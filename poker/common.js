
const lzma = new LZMA("/lib/lzma_worker.js");

const PRIZE_DISTS = [
    [1, [100]],
    [5, [70, 30]],
    [11, [50, 30, 20]],
    [21, [37, 25, 15, 12, 11]],
    [31, [35, 22, 15, 11, 9, 8]],
    [41, [32, 18, 12.5, 10.5, 8.3, 7.3, 6.2, 5.2]]
];

const game_state = {
    "players": [],
    "players_remaining": 0,
    "n_buy_ins": 0
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function calculate_prizes() {
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
        var value = Math.round(dist[i] * prize_pool / 100);
        if (i == 0) {
            value = pool_remaining;
        }
        prizes.unshift(value);
        pool_remaining -= value;
    }
    return prizes;
}

function calculate_league_points() {
    var n_players = game_state.players.length;
    var n_tables = Math.ceil(n_players / 6);
    var points = [];
    for (var i=0; i<n_players; i++) {
        points.push(Math.floor(n_players / (i + 1)))
    }
    return points;
}

function build_date_string() {
    var date = new Date();
    return date.getFullYear() + '/' + pad(date.getMonth() + 1) + '/' + pad(date.getDate());
}

function add_th(n) {
    var suffix = 'th';
    if ((n % 100) / 10 == 1) {
        suffix = 'th';
    } else if (n % 10 == 1) {
        suffix = 'st';
    } else if (n % 10 == 2) {
        suffix = 'nd';
    } else if (n % 10 == 3) {
        suffix = 'th';
    }
    return n + suffix;
}

function pad(n, length=2) {
    n = n.toString();
    while (n.length < length) {
        n = '0' + n;
    }
    return n;
}
