
var lzma = new LZMA("/lib/lzma_worker.js");

function draw_sweep() {
    entrants = extract_entrants();
    if (entrants.length > 280) {
        alert("Too many entrants; maximum is 280");
        return;
    }
    draw_result = perform_draw(entrants);
    update_url(draw_result);
    render_draw_result(draw_result);
}

function extract_entrants() {
    var entrants = []
    document.getElementById("entrants").value.split(',').forEach(entrant => {
        entrants.push(entrant.trim());
    });
    return entrants;
}

function perform_draw(entrants) {
    var variables;
    var pool;
    for (var i in POSSIBILITIES) {
        if (POSSIBILITIES[i][1].length >= entrants.length) {
            variables = POSSIBILITIES[i][0];
            pool = [].concat(POSSIBILITIES[i][1]);
            break;
        }
    }
    draw_result = {
        "variables": variables,
        "result": [],
        "no-winner": pool,
    };
    entrants.forEach(entrant => {
        var index = Math.floor(Math.random() * pool.length);
        var result = [].concat(pool[index]);
        pool.splice(index, 1);
        result.unshift(entrant);
        draw_result["result"].push(result);
    });
    return draw_result;
}

function render_draw_result(draw_result) {
    var table = '<thead><tr><th>Entrant</th>';
    for (var i in draw_result["variables"]) {
        table += '<th>' + draw_result["variables"][i] + '</th>';
    }
    table += '</tr></thead><tbody>';
    for (var i in draw_result["result"]) {
        table += '<tr>';
        for (var j in draw_result["result"][i]) {
            table += '<td>' + draw_result["result"][i][j] + '</td>';
        }
        table += '</tr>';
    }
    document.getElementById("draw-result").innerHTML = table;
    document.getElementById("draw").classList.remove("hidden");
    document.getElementById("explanation").classList.add("hidden");
    render_no_winner(draw_result["variables"], draw_result["no-winner"]);
}

function render_no_winner(variables, possibilities) {
    if (possibilities.length == 0) {
        return;
    }
    var table = '<thead><tr>';
    for (var i in variables) {
        table += '<th>' + variables[i] + '</th>';
    }
    table += '</tr></thead><tbody>';
    for (var i in possibilities) {
        table += '<tr>';
        for (var j in possibilities[i]) {
            table += '<td>' + possibilities[i][j] + '</td>';
        }
        table += '</tr>';
    }
    document.getElementById("no-winner-table").innerHTML = table;
    document.getElementById("no-winner").classList.remove("hidden");
}

function update_url(draw_result) {
    lzma.compress(JSON.stringify(draw_result), 1, function(compressed, error) {
        if (error) {
            alert('Failed to compress data: ' + error);
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function () {
            var base64 = reader.result.substr(reader.result.indexOf(',') + 1);
            var url = '#' + base64;
            window.location.assign(url);
        };
        reader.readAsDataURL(new Blob([new Uint8Array(compressed)]));
    });
}

function url_reload() {
    var base64 = location.hash.substr(1);
    if (base64.length == 0) {
        document.getElementById("draw-result").innerHTML = '';
        document.getElementById("draw").classList.add("hidden");
        document.getElementById("explanation").classList.remove("hidden");
        document.getElementById("no-winner-table").innerHTML = '';
        document.getElementById("no-winner").classList.add("hidden");
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
                render_draw_result(data);
            });
        };
        reader.readAsArrayBuffer(blob);
    });
}

document.addEventListener('DOMContentLoaded', url_reload);
window.addEventListener("hashchange", url_reload);

/*
 * Lists of possibilities: this could be generated dynamically, but javascript
 * makes this much more painful than it needs to be. Instead, it is generated
 * using the below python script:
 *
 * import json
 * 
 * SEEDED = ['Portugal', 'Italy', 'Russia', 'Sweden', 'Wales']
 * UNSEEDED = ['Turkey', 'Poland', 'North Macedonia', 'Ukraine', 'Austria', 'Czechia']
 * HOME_AWAY = ['home', 'away']
 * 
 * POSSIBILITIES = [
 *     [
 *         ["Seeded team in other semi-final"],
 *         [[seeded] for seeded in SEEDED]
 *     ],
 *     [
 *         ["Semi-final opponents"],
 *         [[unseeded] for unseeded in UNSEEDED]
 *     ],
 *     [
 *         [
 *             "Seeded team in other semi-final",
 *             "Home/away in final",
 *         ],
 *         [
 *             (seeded, ha)
 *             for seeded in SEEDED
 *             for ha in HOME_AWAY
 *         ]
 *     ],
 *     [
 *         [
 *             "Semi-final opponents",
 *             "Home/away in final",
 *         ],
 *         [
 *             (semifinal, ha)
 *             for semifinal in UNSEEDED
 *             for ha in HOME_AWAY
 *         ]
 *     ],
 *     [
 *         [
 *             "Semi-final opponents",
 *             "Seeded team in other semi-final",
 *         ],
 *         [
 *             (semifinal, seeded)
 *             for semifinal in UNSEEDED
 *             for seeded in SEEDED
 *             if (semifinal, seeded) != ('Ukraine', 'Russia')
 *         ]
 *     ],
 *     [
 *         [
 *             "Semi-final opponents",
 *             "Seeded team in other semi-final",
 *             "Home/away in final",
 *         ],
 *         [
 *             (semifinal, seeded, ha)
 *             for semifinal in UNSEEDED
 *             for seeded in SEEDED
 *             for ha in HOME_AWAY
 *             if (semifinal, seeded) != ('Ukraine', 'Russia')
 *         ]
 *     ],
 *     [
 *         [
 *             "Semi-final opponents",
 *             "Seeded team in other semi-final",
 *             "Unseeded team in other semi-final",
 *         ],
 *         [
 *             (semifinal, seeded, unseeded)
 *             for semifinal in UNSEEDED
 *             for unseeded in UNSEEDED
 *             for seeded in SEEDED
 *             if (semifinal, seeded) != ('Ukraine', 'Russia')
 *             if (unseeded, seeded) != ('Ukraine', 'Russia')
 *             if semifinal != unseeded
 *         ]
 *     ],
 *     [
 *         [
 *             "Semi-final opponents",
 *             "Seeded team in other semi-final",
 *             "Unseeded team in other semi-final",
 *             "Home/away in final",
 *         ],
 *         [
 *             (semifinal, seeded, unseeded, ha)
 *             for semifinal in UNSEEDED
 *             for unseeded in UNSEEDED
 *             for seeded in SEEDED
 *             for ha in HOME_AWAY
 *             if (semifinal, seeded) != ('Ukraine', 'Russia')
 *             if (unseeded, seeded) != ('Ukraine', 'Russia')
 *             if semifinal != unseeded
 *         ]
 *     ],
 * ]
 * 
 * print(json.dumps(POSSIBILITIES, indent=4))
 *
 */

const POSSIBILITIES = [
    [
        [
            "Seeded team in other semi-final"
        ],
        [
            [
                "Portugal"
            ],
            [
                "Italy"
            ],
            [
                "Russia"
            ],
            [
                "Sweden"
            ],
            [
                "Wales"
            ]
        ]
    ],
    [
        [
            "Semi-final opponents"
        ],
        [
            [
                "Turkey"
            ],
            [
                "Poland"
            ],
            [
                "North Macedonia"
            ],
            [
                "Ukraine"
            ],
            [
                "Austria"
            ],
            [
                "Czechia"
            ]
        ]
    ],
    [
        [
            "Seeded team in other semi-final",
            "Home/away in final"
        ],
        [
            [
                "Portugal",
                "home"
            ],
            [
                "Portugal",
                "away"
            ],
            [
                "Italy",
                "home"
            ],
            [
                "Italy",
                "away"
            ],
            [
                "Russia",
                "home"
            ],
            [
                "Russia",
                "away"
            ],
            [
                "Sweden",
                "home"
            ],
            [
                "Sweden",
                "away"
            ],
            [
                "Wales",
                "home"
            ],
            [
                "Wales",
                "away"
            ]
        ]
    ],
    [
        [
            "Semi-final opponents",
            "Home/away in final"
        ],
        [
            [
                "Turkey",
                "home"
            ],
            [
                "Turkey",
                "away"
            ],
            [
                "Poland",
                "home"
            ],
            [
                "Poland",
                "away"
            ],
            [
                "North Macedonia",
                "home"
            ],
            [
                "North Macedonia",
                "away"
            ],
            [
                "Ukraine",
                "home"
            ],
            [
                "Ukraine",
                "away"
            ],
            [
                "Austria",
                "home"
            ],
            [
                "Austria",
                "away"
            ],
            [
                "Czechia",
                "home"
            ],
            [
                "Czechia",
                "away"
            ]
        ]
    ],
    [
        [
            "Semi-final opponents",
            "Seeded team in other semi-final"
        ],
        [
            [
                "Turkey",
                "Portugal"
            ],
            [
                "Turkey",
                "Italy"
            ],
            [
                "Turkey",
                "Russia"
            ],
            [
                "Turkey",
                "Sweden"
            ],
            [
                "Turkey",
                "Wales"
            ],
            [
                "Poland",
                "Portugal"
            ],
            [
                "Poland",
                "Italy"
            ],
            [
                "Poland",
                "Russia"
            ],
            [
                "Poland",
                "Sweden"
            ],
            [
                "Poland",
                "Wales"
            ],
            [
                "North Macedonia",
                "Portugal"
            ],
            [
                "North Macedonia",
                "Italy"
            ],
            [
                "North Macedonia",
                "Russia"
            ],
            [
                "North Macedonia",
                "Sweden"
            ],
            [
                "North Macedonia",
                "Wales"
            ],
            [
                "Ukraine",
                "Portugal"
            ],
            [
                "Ukraine",
                "Italy"
            ],
            [
                "Ukraine",
                "Sweden"
            ],
            [
                "Ukraine",
                "Wales"
            ],
            [
                "Austria",
                "Portugal"
            ],
            [
                "Austria",
                "Italy"
            ],
            [
                "Austria",
                "Russia"
            ],
            [
                "Austria",
                "Sweden"
            ],
            [
                "Austria",
                "Wales"
            ],
            [
                "Czechia",
                "Portugal"
            ],
            [
                "Czechia",
                "Italy"
            ],
            [
                "Czechia",
                "Russia"
            ],
            [
                "Czechia",
                "Sweden"
            ],
            [
                "Czechia",
                "Wales"
            ]
        ]
    ],
    [
        [
            "Semi-final opponents",
            "Seeded team in other semi-final",
            "Home/away in final"
        ],
        [
            [
                "Turkey",
                "Portugal",
                "home"
            ],
            [
                "Turkey",
                "Portugal",
                "away"
            ],
            [
                "Turkey",
                "Italy",
                "home"
            ],
            [
                "Turkey",
                "Italy",
                "away"
            ],
            [
                "Turkey",
                "Russia",
                "home"
            ],
            [
                "Turkey",
                "Russia",
                "away"
            ],
            [
                "Turkey",
                "Sweden",
                "home"
            ],
            [
                "Turkey",
                "Sweden",
                "away"
            ],
            [
                "Turkey",
                "Wales",
                "home"
            ],
            [
                "Turkey",
                "Wales",
                "away"
            ],
            [
                "Poland",
                "Portugal",
                "home"
            ],
            [
                "Poland",
                "Portugal",
                "away"
            ],
            [
                "Poland",
                "Italy",
                "home"
            ],
            [
                "Poland",
                "Italy",
                "away"
            ],
            [
                "Poland",
                "Russia",
                "home"
            ],
            [
                "Poland",
                "Russia",
                "away"
            ],
            [
                "Poland",
                "Sweden",
                "home"
            ],
            [
                "Poland",
                "Sweden",
                "away"
            ],
            [
                "Poland",
                "Wales",
                "home"
            ],
            [
                "Poland",
                "Wales",
                "away"
            ],
            [
                "North Macedonia",
                "Portugal",
                "home"
            ],
            [
                "North Macedonia",
                "Portugal",
                "away"
            ],
            [
                "North Macedonia",
                "Italy",
                "home"
            ],
            [
                "North Macedonia",
                "Italy",
                "away"
            ],
            [
                "North Macedonia",
                "Russia",
                "home"
            ],
            [
                "North Macedonia",
                "Russia",
                "away"
            ],
            [
                "North Macedonia",
                "Sweden",
                "home"
            ],
            [
                "North Macedonia",
                "Sweden",
                "away"
            ],
            [
                "North Macedonia",
                "Wales",
                "home"
            ],
            [
                "North Macedonia",
                "Wales",
                "away"
            ],
            [
                "Ukraine",
                "Portugal",
                "home"
            ],
            [
                "Ukraine",
                "Portugal",
                "away"
            ],
            [
                "Ukraine",
                "Italy",
                "home"
            ],
            [
                "Ukraine",
                "Italy",
                "away"
            ],
            [
                "Ukraine",
                "Sweden",
                "home"
            ],
            [
                "Ukraine",
                "Sweden",
                "away"
            ],
            [
                "Ukraine",
                "Wales",
                "home"
            ],
            [
                "Ukraine",
                "Wales",
                "away"
            ],
            [
                "Austria",
                "Portugal",
                "home"
            ],
            [
                "Austria",
                "Portugal",
                "away"
            ],
            [
                "Austria",
                "Italy",
                "home"
            ],
            [
                "Austria",
                "Italy",
                "away"
            ],
            [
                "Austria",
                "Russia",
                "home"
            ],
            [
                "Austria",
                "Russia",
                "away"
            ],
            [
                "Austria",
                "Sweden",
                "home"
            ],
            [
                "Austria",
                "Sweden",
                "away"
            ],
            [
                "Austria",
                "Wales",
                "home"
            ],
            [
                "Austria",
                "Wales",
                "away"
            ],
            [
                "Czechia",
                "Portugal",
                "home"
            ],
            [
                "Czechia",
                "Portugal",
                "away"
            ],
            [
                "Czechia",
                "Italy",
                "home"
            ],
            [
                "Czechia",
                "Italy",
                "away"
            ],
            [
                "Czechia",
                "Russia",
                "home"
            ],
            [
                "Czechia",
                "Russia",
                "away"
            ],
            [
                "Czechia",
                "Sweden",
                "home"
            ],
            [
                "Czechia",
                "Sweden",
                "away"
            ],
            [
                "Czechia",
                "Wales",
                "home"
            ],
            [
                "Czechia",
                "Wales",
                "away"
            ]
        ]
    ],
    [
        [
            "Semi-final opponents",
            "Seeded team in other semi-final",
            "Unseeded team in other semi-final"
        ],
        [
            [
                "Turkey",
                "Portugal",
                "Poland"
            ],
            [
                "Turkey",
                "Italy",
                "Poland"
            ],
            [
                "Turkey",
                "Russia",
                "Poland"
            ],
            [
                "Turkey",
                "Sweden",
                "Poland"
            ],
            [
                "Turkey",
                "Wales",
                "Poland"
            ],
            [
                "Turkey",
                "Portugal",
                "North Macedonia"
            ],
            [
                "Turkey",
                "Italy",
                "North Macedonia"
            ],
            [
                "Turkey",
                "Russia",
                "North Macedonia"
            ],
            [
                "Turkey",
                "Sweden",
                "North Macedonia"
            ],
            [
                "Turkey",
                "Wales",
                "North Macedonia"
            ],
            [
                "Turkey",
                "Portugal",
                "Ukraine"
            ],
            [
                "Turkey",
                "Italy",
                "Ukraine"
            ],
            [
                "Turkey",
                "Sweden",
                "Ukraine"
            ],
            [
                "Turkey",
                "Wales",
                "Ukraine"
            ],
            [
                "Turkey",
                "Portugal",
                "Austria"
            ],
            [
                "Turkey",
                "Italy",
                "Austria"
            ],
            [
                "Turkey",
                "Russia",
                "Austria"
            ],
            [
                "Turkey",
                "Sweden",
                "Austria"
            ],
            [
                "Turkey",
                "Wales",
                "Austria"
            ],
            [
                "Turkey",
                "Portugal",
                "Czechia"
            ],
            [
                "Turkey",
                "Italy",
                "Czechia"
            ],
            [
                "Turkey",
                "Russia",
                "Czechia"
            ],
            [
                "Turkey",
                "Sweden",
                "Czechia"
            ],
            [
                "Turkey",
                "Wales",
                "Czechia"
            ],
            [
                "Poland",
                "Portugal",
                "Turkey"
            ],
            [
                "Poland",
                "Italy",
                "Turkey"
            ],
            [
                "Poland",
                "Russia",
                "Turkey"
            ],
            [
                "Poland",
                "Sweden",
                "Turkey"
            ],
            [
                "Poland",
                "Wales",
                "Turkey"
            ],
            [
                "Poland",
                "Portugal",
                "North Macedonia"
            ],
            [
                "Poland",
                "Italy",
                "North Macedonia"
            ],
            [
                "Poland",
                "Russia",
                "North Macedonia"
            ],
            [
                "Poland",
                "Sweden",
                "North Macedonia"
            ],
            [
                "Poland",
                "Wales",
                "North Macedonia"
            ],
            [
                "Poland",
                "Portugal",
                "Ukraine"
            ],
            [
                "Poland",
                "Italy",
                "Ukraine"
            ],
            [
                "Poland",
                "Sweden",
                "Ukraine"
            ],
            [
                "Poland",
                "Wales",
                "Ukraine"
            ],
            [
                "Poland",
                "Portugal",
                "Austria"
            ],
            [
                "Poland",
                "Italy",
                "Austria"
            ],
            [
                "Poland",
                "Russia",
                "Austria"
            ],
            [
                "Poland",
                "Sweden",
                "Austria"
            ],
            [
                "Poland",
                "Wales",
                "Austria"
            ],
            [
                "Poland",
                "Portugal",
                "Czechia"
            ],
            [
                "Poland",
                "Italy",
                "Czechia"
            ],
            [
                "Poland",
                "Russia",
                "Czechia"
            ],
            [
                "Poland",
                "Sweden",
                "Czechia"
            ],
            [
                "Poland",
                "Wales",
                "Czechia"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Turkey"
            ],
            [
                "North Macedonia",
                "Italy",
                "Turkey"
            ],
            [
                "North Macedonia",
                "Russia",
                "Turkey"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Turkey"
            ],
            [
                "North Macedonia",
                "Wales",
                "Turkey"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Poland"
            ],
            [
                "North Macedonia",
                "Italy",
                "Poland"
            ],
            [
                "North Macedonia",
                "Russia",
                "Poland"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Poland"
            ],
            [
                "North Macedonia",
                "Wales",
                "Poland"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Ukraine"
            ],
            [
                "North Macedonia",
                "Italy",
                "Ukraine"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Ukraine"
            ],
            [
                "North Macedonia",
                "Wales",
                "Ukraine"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Austria"
            ],
            [
                "North Macedonia",
                "Italy",
                "Austria"
            ],
            [
                "North Macedonia",
                "Russia",
                "Austria"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Austria"
            ],
            [
                "North Macedonia",
                "Wales",
                "Austria"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Czechia"
            ],
            [
                "North Macedonia",
                "Italy",
                "Czechia"
            ],
            [
                "North Macedonia",
                "Russia",
                "Czechia"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Czechia"
            ],
            [
                "North Macedonia",
                "Wales",
                "Czechia"
            ],
            [
                "Ukraine",
                "Portugal",
                "Turkey"
            ],
            [
                "Ukraine",
                "Italy",
                "Turkey"
            ],
            [
                "Ukraine",
                "Sweden",
                "Turkey"
            ],
            [
                "Ukraine",
                "Wales",
                "Turkey"
            ],
            [
                "Ukraine",
                "Portugal",
                "Poland"
            ],
            [
                "Ukraine",
                "Italy",
                "Poland"
            ],
            [
                "Ukraine",
                "Sweden",
                "Poland"
            ],
            [
                "Ukraine",
                "Wales",
                "Poland"
            ],
            [
                "Ukraine",
                "Portugal",
                "North Macedonia"
            ],
            [
                "Ukraine",
                "Italy",
                "North Macedonia"
            ],
            [
                "Ukraine",
                "Sweden",
                "North Macedonia"
            ],
            [
                "Ukraine",
                "Wales",
                "North Macedonia"
            ],
            [
                "Ukraine",
                "Portugal",
                "Austria"
            ],
            [
                "Ukraine",
                "Italy",
                "Austria"
            ],
            [
                "Ukraine",
                "Sweden",
                "Austria"
            ],
            [
                "Ukraine",
                "Wales",
                "Austria"
            ],
            [
                "Ukraine",
                "Portugal",
                "Czechia"
            ],
            [
                "Ukraine",
                "Italy",
                "Czechia"
            ],
            [
                "Ukraine",
                "Sweden",
                "Czechia"
            ],
            [
                "Ukraine",
                "Wales",
                "Czechia"
            ],
            [
                "Austria",
                "Portugal",
                "Turkey"
            ],
            [
                "Austria",
                "Italy",
                "Turkey"
            ],
            [
                "Austria",
                "Russia",
                "Turkey"
            ],
            [
                "Austria",
                "Sweden",
                "Turkey"
            ],
            [
                "Austria",
                "Wales",
                "Turkey"
            ],
            [
                "Austria",
                "Portugal",
                "Poland"
            ],
            [
                "Austria",
                "Italy",
                "Poland"
            ],
            [
                "Austria",
                "Russia",
                "Poland"
            ],
            [
                "Austria",
                "Sweden",
                "Poland"
            ],
            [
                "Austria",
                "Wales",
                "Poland"
            ],
            [
                "Austria",
                "Portugal",
                "North Macedonia"
            ],
            [
                "Austria",
                "Italy",
                "North Macedonia"
            ],
            [
                "Austria",
                "Russia",
                "North Macedonia"
            ],
            [
                "Austria",
                "Sweden",
                "North Macedonia"
            ],
            [
                "Austria",
                "Wales",
                "North Macedonia"
            ],
            [
                "Austria",
                "Portugal",
                "Ukraine"
            ],
            [
                "Austria",
                "Italy",
                "Ukraine"
            ],
            [
                "Austria",
                "Sweden",
                "Ukraine"
            ],
            [
                "Austria",
                "Wales",
                "Ukraine"
            ],
            [
                "Austria",
                "Portugal",
                "Czechia"
            ],
            [
                "Austria",
                "Italy",
                "Czechia"
            ],
            [
                "Austria",
                "Russia",
                "Czechia"
            ],
            [
                "Austria",
                "Sweden",
                "Czechia"
            ],
            [
                "Austria",
                "Wales",
                "Czechia"
            ],
            [
                "Czechia",
                "Portugal",
                "Turkey"
            ],
            [
                "Czechia",
                "Italy",
                "Turkey"
            ],
            [
                "Czechia",
                "Russia",
                "Turkey"
            ],
            [
                "Czechia",
                "Sweden",
                "Turkey"
            ],
            [
                "Czechia",
                "Wales",
                "Turkey"
            ],
            [
                "Czechia",
                "Portugal",
                "Poland"
            ],
            [
                "Czechia",
                "Italy",
                "Poland"
            ],
            [
                "Czechia",
                "Russia",
                "Poland"
            ],
            [
                "Czechia",
                "Sweden",
                "Poland"
            ],
            [
                "Czechia",
                "Wales",
                "Poland"
            ],
            [
                "Czechia",
                "Portugal",
                "North Macedonia"
            ],
            [
                "Czechia",
                "Italy",
                "North Macedonia"
            ],
            [
                "Czechia",
                "Russia",
                "North Macedonia"
            ],
            [
                "Czechia",
                "Sweden",
                "North Macedonia"
            ],
            [
                "Czechia",
                "Wales",
                "North Macedonia"
            ],
            [
                "Czechia",
                "Portugal",
                "Ukraine"
            ],
            [
                "Czechia",
                "Italy",
                "Ukraine"
            ],
            [
                "Czechia",
                "Sweden",
                "Ukraine"
            ],
            [
                "Czechia",
                "Wales",
                "Ukraine"
            ],
            [
                "Czechia",
                "Portugal",
                "Austria"
            ],
            [
                "Czechia",
                "Italy",
                "Austria"
            ],
            [
                "Czechia",
                "Russia",
                "Austria"
            ],
            [
                "Czechia",
                "Sweden",
                "Austria"
            ],
            [
                "Czechia",
                "Wales",
                "Austria"
            ]
        ]
    ],
    [
        [
            "Semi-final opponents",
            "Seeded team in other semi-final",
            "Unseeded team in other semi-final",
            "Home/away in final"
        ],
        [
            [
                "Turkey",
                "Portugal",
                "Poland",
                "home"
            ],
            [
                "Turkey",
                "Portugal",
                "Poland",
                "away"
            ],
            [
                "Turkey",
                "Italy",
                "Poland",
                "home"
            ],
            [
                "Turkey",
                "Italy",
                "Poland",
                "away"
            ],
            [
                "Turkey",
                "Russia",
                "Poland",
                "home"
            ],
            [
                "Turkey",
                "Russia",
                "Poland",
                "away"
            ],
            [
                "Turkey",
                "Sweden",
                "Poland",
                "home"
            ],
            [
                "Turkey",
                "Sweden",
                "Poland",
                "away"
            ],
            [
                "Turkey",
                "Wales",
                "Poland",
                "home"
            ],
            [
                "Turkey",
                "Wales",
                "Poland",
                "away"
            ],
            [
                "Turkey",
                "Portugal",
                "North Macedonia",
                "home"
            ],
            [
                "Turkey",
                "Portugal",
                "North Macedonia",
                "away"
            ],
            [
                "Turkey",
                "Italy",
                "North Macedonia",
                "home"
            ],
            [
                "Turkey",
                "Italy",
                "North Macedonia",
                "away"
            ],
            [
                "Turkey",
                "Russia",
                "North Macedonia",
                "home"
            ],
            [
                "Turkey",
                "Russia",
                "North Macedonia",
                "away"
            ],
            [
                "Turkey",
                "Sweden",
                "North Macedonia",
                "home"
            ],
            [
                "Turkey",
                "Sweden",
                "North Macedonia",
                "away"
            ],
            [
                "Turkey",
                "Wales",
                "North Macedonia",
                "home"
            ],
            [
                "Turkey",
                "Wales",
                "North Macedonia",
                "away"
            ],
            [
                "Turkey",
                "Portugal",
                "Ukraine",
                "home"
            ],
            [
                "Turkey",
                "Portugal",
                "Ukraine",
                "away"
            ],
            [
                "Turkey",
                "Italy",
                "Ukraine",
                "home"
            ],
            [
                "Turkey",
                "Italy",
                "Ukraine",
                "away"
            ],
            [
                "Turkey",
                "Sweden",
                "Ukraine",
                "home"
            ],
            [
                "Turkey",
                "Sweden",
                "Ukraine",
                "away"
            ],
            [
                "Turkey",
                "Wales",
                "Ukraine",
                "home"
            ],
            [
                "Turkey",
                "Wales",
                "Ukraine",
                "away"
            ],
            [
                "Turkey",
                "Portugal",
                "Austria",
                "home"
            ],
            [
                "Turkey",
                "Portugal",
                "Austria",
                "away"
            ],
            [
                "Turkey",
                "Italy",
                "Austria",
                "home"
            ],
            [
                "Turkey",
                "Italy",
                "Austria",
                "away"
            ],
            [
                "Turkey",
                "Russia",
                "Austria",
                "home"
            ],
            [
                "Turkey",
                "Russia",
                "Austria",
                "away"
            ],
            [
                "Turkey",
                "Sweden",
                "Austria",
                "home"
            ],
            [
                "Turkey",
                "Sweden",
                "Austria",
                "away"
            ],
            [
                "Turkey",
                "Wales",
                "Austria",
                "home"
            ],
            [
                "Turkey",
                "Wales",
                "Austria",
                "away"
            ],
            [
                "Turkey",
                "Portugal",
                "Czechia",
                "home"
            ],
            [
                "Turkey",
                "Portugal",
                "Czechia",
                "away"
            ],
            [
                "Turkey",
                "Italy",
                "Czechia",
                "home"
            ],
            [
                "Turkey",
                "Italy",
                "Czechia",
                "away"
            ],
            [
                "Turkey",
                "Russia",
                "Czechia",
                "home"
            ],
            [
                "Turkey",
                "Russia",
                "Czechia",
                "away"
            ],
            [
                "Turkey",
                "Sweden",
                "Czechia",
                "home"
            ],
            [
                "Turkey",
                "Sweden",
                "Czechia",
                "away"
            ],
            [
                "Turkey",
                "Wales",
                "Czechia",
                "home"
            ],
            [
                "Turkey",
                "Wales",
                "Czechia",
                "away"
            ],
            [
                "Poland",
                "Portugal",
                "Turkey",
                "home"
            ],
            [
                "Poland",
                "Portugal",
                "Turkey",
                "away"
            ],
            [
                "Poland",
                "Italy",
                "Turkey",
                "home"
            ],
            [
                "Poland",
                "Italy",
                "Turkey",
                "away"
            ],
            [
                "Poland",
                "Russia",
                "Turkey",
                "home"
            ],
            [
                "Poland",
                "Russia",
                "Turkey",
                "away"
            ],
            [
                "Poland",
                "Sweden",
                "Turkey",
                "home"
            ],
            [
                "Poland",
                "Sweden",
                "Turkey",
                "away"
            ],
            [
                "Poland",
                "Wales",
                "Turkey",
                "home"
            ],
            [
                "Poland",
                "Wales",
                "Turkey",
                "away"
            ],
            [
                "Poland",
                "Portugal",
                "North Macedonia",
                "home"
            ],
            [
                "Poland",
                "Portugal",
                "North Macedonia",
                "away"
            ],
            [
                "Poland",
                "Italy",
                "North Macedonia",
                "home"
            ],
            [
                "Poland",
                "Italy",
                "North Macedonia",
                "away"
            ],
            [
                "Poland",
                "Russia",
                "North Macedonia",
                "home"
            ],
            [
                "Poland",
                "Russia",
                "North Macedonia",
                "away"
            ],
            [
                "Poland",
                "Sweden",
                "North Macedonia",
                "home"
            ],
            [
                "Poland",
                "Sweden",
                "North Macedonia",
                "away"
            ],
            [
                "Poland",
                "Wales",
                "North Macedonia",
                "home"
            ],
            [
                "Poland",
                "Wales",
                "North Macedonia",
                "away"
            ],
            [
                "Poland",
                "Portugal",
                "Ukraine",
                "home"
            ],
            [
                "Poland",
                "Portugal",
                "Ukraine",
                "away"
            ],
            [
                "Poland",
                "Italy",
                "Ukraine",
                "home"
            ],
            [
                "Poland",
                "Italy",
                "Ukraine",
                "away"
            ],
            [
                "Poland",
                "Sweden",
                "Ukraine",
                "home"
            ],
            [
                "Poland",
                "Sweden",
                "Ukraine",
                "away"
            ],
            [
                "Poland",
                "Wales",
                "Ukraine",
                "home"
            ],
            [
                "Poland",
                "Wales",
                "Ukraine",
                "away"
            ],
            [
                "Poland",
                "Portugal",
                "Austria",
                "home"
            ],
            [
                "Poland",
                "Portugal",
                "Austria",
                "away"
            ],
            [
                "Poland",
                "Italy",
                "Austria",
                "home"
            ],
            [
                "Poland",
                "Italy",
                "Austria",
                "away"
            ],
            [
                "Poland",
                "Russia",
                "Austria",
                "home"
            ],
            [
                "Poland",
                "Russia",
                "Austria",
                "away"
            ],
            [
                "Poland",
                "Sweden",
                "Austria",
                "home"
            ],
            [
                "Poland",
                "Sweden",
                "Austria",
                "away"
            ],
            [
                "Poland",
                "Wales",
                "Austria",
                "home"
            ],
            [
                "Poland",
                "Wales",
                "Austria",
                "away"
            ],
            [
                "Poland",
                "Portugal",
                "Czechia",
                "home"
            ],
            [
                "Poland",
                "Portugal",
                "Czechia",
                "away"
            ],
            [
                "Poland",
                "Italy",
                "Czechia",
                "home"
            ],
            [
                "Poland",
                "Italy",
                "Czechia",
                "away"
            ],
            [
                "Poland",
                "Russia",
                "Czechia",
                "home"
            ],
            [
                "Poland",
                "Russia",
                "Czechia",
                "away"
            ],
            [
                "Poland",
                "Sweden",
                "Czechia",
                "home"
            ],
            [
                "Poland",
                "Sweden",
                "Czechia",
                "away"
            ],
            [
                "Poland",
                "Wales",
                "Czechia",
                "home"
            ],
            [
                "Poland",
                "Wales",
                "Czechia",
                "away"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Turkey",
                "home"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Turkey",
                "away"
            ],
            [
                "North Macedonia",
                "Italy",
                "Turkey",
                "home"
            ],
            [
                "North Macedonia",
                "Italy",
                "Turkey",
                "away"
            ],
            [
                "North Macedonia",
                "Russia",
                "Turkey",
                "home"
            ],
            [
                "North Macedonia",
                "Russia",
                "Turkey",
                "away"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Turkey",
                "home"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Turkey",
                "away"
            ],
            [
                "North Macedonia",
                "Wales",
                "Turkey",
                "home"
            ],
            [
                "North Macedonia",
                "Wales",
                "Turkey",
                "away"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Poland",
                "home"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Poland",
                "away"
            ],
            [
                "North Macedonia",
                "Italy",
                "Poland",
                "home"
            ],
            [
                "North Macedonia",
                "Italy",
                "Poland",
                "away"
            ],
            [
                "North Macedonia",
                "Russia",
                "Poland",
                "home"
            ],
            [
                "North Macedonia",
                "Russia",
                "Poland",
                "away"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Poland",
                "home"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Poland",
                "away"
            ],
            [
                "North Macedonia",
                "Wales",
                "Poland",
                "home"
            ],
            [
                "North Macedonia",
                "Wales",
                "Poland",
                "away"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Ukraine",
                "home"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Ukraine",
                "away"
            ],
            [
                "North Macedonia",
                "Italy",
                "Ukraine",
                "home"
            ],
            [
                "North Macedonia",
                "Italy",
                "Ukraine",
                "away"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Ukraine",
                "home"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Ukraine",
                "away"
            ],
            [
                "North Macedonia",
                "Wales",
                "Ukraine",
                "home"
            ],
            [
                "North Macedonia",
                "Wales",
                "Ukraine",
                "away"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Austria",
                "home"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Austria",
                "away"
            ],
            [
                "North Macedonia",
                "Italy",
                "Austria",
                "home"
            ],
            [
                "North Macedonia",
                "Italy",
                "Austria",
                "away"
            ],
            [
                "North Macedonia",
                "Russia",
                "Austria",
                "home"
            ],
            [
                "North Macedonia",
                "Russia",
                "Austria",
                "away"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Austria",
                "home"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Austria",
                "away"
            ],
            [
                "North Macedonia",
                "Wales",
                "Austria",
                "home"
            ],
            [
                "North Macedonia",
                "Wales",
                "Austria",
                "away"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Czechia",
                "home"
            ],
            [
                "North Macedonia",
                "Portugal",
                "Czechia",
                "away"
            ],
            [
                "North Macedonia",
                "Italy",
                "Czechia",
                "home"
            ],
            [
                "North Macedonia",
                "Italy",
                "Czechia",
                "away"
            ],
            [
                "North Macedonia",
                "Russia",
                "Czechia",
                "home"
            ],
            [
                "North Macedonia",
                "Russia",
                "Czechia",
                "away"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Czechia",
                "home"
            ],
            [
                "North Macedonia",
                "Sweden",
                "Czechia",
                "away"
            ],
            [
                "North Macedonia",
                "Wales",
                "Czechia",
                "home"
            ],
            [
                "North Macedonia",
                "Wales",
                "Czechia",
                "away"
            ],
            [
                "Ukraine",
                "Portugal",
                "Turkey",
                "home"
            ],
            [
                "Ukraine",
                "Portugal",
                "Turkey",
                "away"
            ],
            [
                "Ukraine",
                "Italy",
                "Turkey",
                "home"
            ],
            [
                "Ukraine",
                "Italy",
                "Turkey",
                "away"
            ],
            [
                "Ukraine",
                "Sweden",
                "Turkey",
                "home"
            ],
            [
                "Ukraine",
                "Sweden",
                "Turkey",
                "away"
            ],
            [
                "Ukraine",
                "Wales",
                "Turkey",
                "home"
            ],
            [
                "Ukraine",
                "Wales",
                "Turkey",
                "away"
            ],
            [
                "Ukraine",
                "Portugal",
                "Poland",
                "home"
            ],
            [
                "Ukraine",
                "Portugal",
                "Poland",
                "away"
            ],
            [
                "Ukraine",
                "Italy",
                "Poland",
                "home"
            ],
            [
                "Ukraine",
                "Italy",
                "Poland",
                "away"
            ],
            [
                "Ukraine",
                "Sweden",
                "Poland",
                "home"
            ],
            [
                "Ukraine",
                "Sweden",
                "Poland",
                "away"
            ],
            [
                "Ukraine",
                "Wales",
                "Poland",
                "home"
            ],
            [
                "Ukraine",
                "Wales",
                "Poland",
                "away"
            ],
            [
                "Ukraine",
                "Portugal",
                "North Macedonia",
                "home"
            ],
            [
                "Ukraine",
                "Portugal",
                "North Macedonia",
                "away"
            ],
            [
                "Ukraine",
                "Italy",
                "North Macedonia",
                "home"
            ],
            [
                "Ukraine",
                "Italy",
                "North Macedonia",
                "away"
            ],
            [
                "Ukraine",
                "Sweden",
                "North Macedonia",
                "home"
            ],
            [
                "Ukraine",
                "Sweden",
                "North Macedonia",
                "away"
            ],
            [
                "Ukraine",
                "Wales",
                "North Macedonia",
                "home"
            ],
            [
                "Ukraine",
                "Wales",
                "North Macedonia",
                "away"
            ],
            [
                "Ukraine",
                "Portugal",
                "Austria",
                "home"
            ],
            [
                "Ukraine",
                "Portugal",
                "Austria",
                "away"
            ],
            [
                "Ukraine",
                "Italy",
                "Austria",
                "home"
            ],
            [
                "Ukraine",
                "Italy",
                "Austria",
                "away"
            ],
            [
                "Ukraine",
                "Sweden",
                "Austria",
                "home"
            ],
            [
                "Ukraine",
                "Sweden",
                "Austria",
                "away"
            ],
            [
                "Ukraine",
                "Wales",
                "Austria",
                "home"
            ],
            [
                "Ukraine",
                "Wales",
                "Austria",
                "away"
            ],
            [
                "Ukraine",
                "Portugal",
                "Czechia",
                "home"
            ],
            [
                "Ukraine",
                "Portugal",
                "Czechia",
                "away"
            ],
            [
                "Ukraine",
                "Italy",
                "Czechia",
                "home"
            ],
            [
                "Ukraine",
                "Italy",
                "Czechia",
                "away"
            ],
            [
                "Ukraine",
                "Sweden",
                "Czechia",
                "home"
            ],
            [
                "Ukraine",
                "Sweden",
                "Czechia",
                "away"
            ],
            [
                "Ukraine",
                "Wales",
                "Czechia",
                "home"
            ],
            [
                "Ukraine",
                "Wales",
                "Czechia",
                "away"
            ],
            [
                "Austria",
                "Portugal",
                "Turkey",
                "home"
            ],
            [
                "Austria",
                "Portugal",
                "Turkey",
                "away"
            ],
            [
                "Austria",
                "Italy",
                "Turkey",
                "home"
            ],
            [
                "Austria",
                "Italy",
                "Turkey",
                "away"
            ],
            [
                "Austria",
                "Russia",
                "Turkey",
                "home"
            ],
            [
                "Austria",
                "Russia",
                "Turkey",
                "away"
            ],
            [
                "Austria",
                "Sweden",
                "Turkey",
                "home"
            ],
            [
                "Austria",
                "Sweden",
                "Turkey",
                "away"
            ],
            [
                "Austria",
                "Wales",
                "Turkey",
                "home"
            ],
            [
                "Austria",
                "Wales",
                "Turkey",
                "away"
            ],
            [
                "Austria",
                "Portugal",
                "Poland",
                "home"
            ],
            [
                "Austria",
                "Portugal",
                "Poland",
                "away"
            ],
            [
                "Austria",
                "Italy",
                "Poland",
                "home"
            ],
            [
                "Austria",
                "Italy",
                "Poland",
                "away"
            ],
            [
                "Austria",
                "Russia",
                "Poland",
                "home"
            ],
            [
                "Austria",
                "Russia",
                "Poland",
                "away"
            ],
            [
                "Austria",
                "Sweden",
                "Poland",
                "home"
            ],
            [
                "Austria",
                "Sweden",
                "Poland",
                "away"
            ],
            [
                "Austria",
                "Wales",
                "Poland",
                "home"
            ],
            [
                "Austria",
                "Wales",
                "Poland",
                "away"
            ],
            [
                "Austria",
                "Portugal",
                "North Macedonia",
                "home"
            ],
            [
                "Austria",
                "Portugal",
                "North Macedonia",
                "away"
            ],
            [
                "Austria",
                "Italy",
                "North Macedonia",
                "home"
            ],
            [
                "Austria",
                "Italy",
                "North Macedonia",
                "away"
            ],
            [
                "Austria",
                "Russia",
                "North Macedonia",
                "home"
            ],
            [
                "Austria",
                "Russia",
                "North Macedonia",
                "away"
            ],
            [
                "Austria",
                "Sweden",
                "North Macedonia",
                "home"
            ],
            [
                "Austria",
                "Sweden",
                "North Macedonia",
                "away"
            ],
            [
                "Austria",
                "Wales",
                "North Macedonia",
                "home"
            ],
            [
                "Austria",
                "Wales",
                "North Macedonia",
                "away"
            ],
            [
                "Austria",
                "Portugal",
                "Ukraine",
                "home"
            ],
            [
                "Austria",
                "Portugal",
                "Ukraine",
                "away"
            ],
            [
                "Austria",
                "Italy",
                "Ukraine",
                "home"
            ],
            [
                "Austria",
                "Italy",
                "Ukraine",
                "away"
            ],
            [
                "Austria",
                "Sweden",
                "Ukraine",
                "home"
            ],
            [
                "Austria",
                "Sweden",
                "Ukraine",
                "away"
            ],
            [
                "Austria",
                "Wales",
                "Ukraine",
                "home"
            ],
            [
                "Austria",
                "Wales",
                "Ukraine",
                "away"
            ],
            [
                "Austria",
                "Portugal",
                "Czechia",
                "home"
            ],
            [
                "Austria",
                "Portugal",
                "Czechia",
                "away"
            ],
            [
                "Austria",
                "Italy",
                "Czechia",
                "home"
            ],
            [
                "Austria",
                "Italy",
                "Czechia",
                "away"
            ],
            [
                "Austria",
                "Russia",
                "Czechia",
                "home"
            ],
            [
                "Austria",
                "Russia",
                "Czechia",
                "away"
            ],
            [
                "Austria",
                "Sweden",
                "Czechia",
                "home"
            ],
            [
                "Austria",
                "Sweden",
                "Czechia",
                "away"
            ],
            [
                "Austria",
                "Wales",
                "Czechia",
                "home"
            ],
            [
                "Austria",
                "Wales",
                "Czechia",
                "away"
            ],
            [
                "Czechia",
                "Portugal",
                "Turkey",
                "home"
            ],
            [
                "Czechia",
                "Portugal",
                "Turkey",
                "away"
            ],
            [
                "Czechia",
                "Italy",
                "Turkey",
                "home"
            ],
            [
                "Czechia",
                "Italy",
                "Turkey",
                "away"
            ],
            [
                "Czechia",
                "Russia",
                "Turkey",
                "home"
            ],
            [
                "Czechia",
                "Russia",
                "Turkey",
                "away"
            ],
            [
                "Czechia",
                "Sweden",
                "Turkey",
                "home"
            ],
            [
                "Czechia",
                "Sweden",
                "Turkey",
                "away"
            ],
            [
                "Czechia",
                "Wales",
                "Turkey",
                "home"
            ],
            [
                "Czechia",
                "Wales",
                "Turkey",
                "away"
            ],
            [
                "Czechia",
                "Portugal",
                "Poland",
                "home"
            ],
            [
                "Czechia",
                "Portugal",
                "Poland",
                "away"
            ],
            [
                "Czechia",
                "Italy",
                "Poland",
                "home"
            ],
            [
                "Czechia",
                "Italy",
                "Poland",
                "away"
            ],
            [
                "Czechia",
                "Russia",
                "Poland",
                "home"
            ],
            [
                "Czechia",
                "Russia",
                "Poland",
                "away"
            ],
            [
                "Czechia",
                "Sweden",
                "Poland",
                "home"
            ],
            [
                "Czechia",
                "Sweden",
                "Poland",
                "away"
            ],
            [
                "Czechia",
                "Wales",
                "Poland",
                "home"
            ],
            [
                "Czechia",
                "Wales",
                "Poland",
                "away"
            ],
            [
                "Czechia",
                "Portugal",
                "North Macedonia",
                "home"
            ],
            [
                "Czechia",
                "Portugal",
                "North Macedonia",
                "away"
            ],
            [
                "Czechia",
                "Italy",
                "North Macedonia",
                "home"
            ],
            [
                "Czechia",
                "Italy",
                "North Macedonia",
                "away"
            ],
            [
                "Czechia",
                "Russia",
                "North Macedonia",
                "home"
            ],
            [
                "Czechia",
                "Russia",
                "North Macedonia",
                "away"
            ],
            [
                "Czechia",
                "Sweden",
                "North Macedonia",
                "home"
            ],
            [
                "Czechia",
                "Sweden",
                "North Macedonia",
                "away"
            ],
            [
                "Czechia",
                "Wales",
                "North Macedonia",
                "home"
            ],
            [
                "Czechia",
                "Wales",
                "North Macedonia",
                "away"
            ],
            [
                "Czechia",
                "Portugal",
                "Ukraine",
                "home"
            ],
            [
                "Czechia",
                "Portugal",
                "Ukraine",
                "away"
            ],
            [
                "Czechia",
                "Italy",
                "Ukraine",
                "home"
            ],
            [
                "Czechia",
                "Italy",
                "Ukraine",
                "away"
            ],
            [
                "Czechia",
                "Sweden",
                "Ukraine",
                "home"
            ],
            [
                "Czechia",
                "Sweden",
                "Ukraine",
                "away"
            ],
            [
                "Czechia",
                "Wales",
                "Ukraine",
                "home"
            ],
            [
                "Czechia",
                "Wales",
                "Ukraine",
                "away"
            ],
            [
                "Czechia",
                "Portugal",
                "Austria",
                "home"
            ],
            [
                "Czechia",
                "Portugal",
                "Austria",
                "away"
            ],
            [
                "Czechia",
                "Italy",
                "Austria",
                "home"
            ],
            [
                "Czechia",
                "Italy",
                "Austria",
                "away"
            ],
            [
                "Czechia",
                "Russia",
                "Austria",
                "home"
            ],
            [
                "Czechia",
                "Russia",
                "Austria",
                "away"
            ],
            [
                "Czechia",
                "Sweden",
                "Austria",
                "home"
            ],
            [
                "Czechia",
                "Sweden",
                "Austria",
                "away"
            ],
            [
                "Czechia",
                "Wales",
                "Austria",
                "home"
            ],
            [
                "Czechia",
                "Wales",
                "Austria",
                "away"
            ]
        ]
    ]
]
