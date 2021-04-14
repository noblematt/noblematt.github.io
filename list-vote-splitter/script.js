const REGIONS = [
    {
        "name": "Highlands and Islands",
        "list_votes": {
            "SNP": 81600,
            "Conservative": 44693,
            "LibDem": 27223,
            "Labour": 22894,
            "Green": 14781,
        },
        "snp_seats": [
            {"name": "Argyll and Bute", "challenger": "LibDem", "margin": (5978 / 13561)},
            {"name": "Caithness, Sutherland and Ross", "challenger": "LibDem", "margin": (3913 / 13937)},
            {"name": "Inverness and Nairn", "challenger": "Conservative", "margin": (10857 / 18505)},
            {"name": "Moray", "challenger": "Conservative", "margin": (2875 / 15742)},
            {"name": "Na h-Eileanan an Iar", "challenger": "Labour", "margin": (3496 / 6874)},
            {"name": "Skye, Lochaber and Badenoch", "challenger": "LibDem", "margin": (9043 / 17362)},
        ],
        "other_seats": [
            {"name": "Orkney", "winner": "LibDem", "margin": (4534 / 2562)},
            {"name": "Shetland", "winner": "LibDem", "margin": (1837 / 3822)},
        ],
    },
    {
        "name": "North East Scotland",
        "list_votes": {
            "SNP": 137086,
            "Conservative": 85848,
            "Labour": 38791,
            "LibDem": 18444,
            "Green": 15123,
        },
        "snp_seats": [
            {"name": "Aberdeen Central", "challenger": "Labour", "margin": (4349 / 11648)},
            {"name": "Aberdeen Donside", "challenger": "Conservative", "margin": (11630 / 17339)},
            {"name": "Aberdeen South and North Kincardine", "challenger": "Conservative", "margin": (2755 / 13604)},
            {"name": "Aberdeenshire East", "challenger": "Conservative", "margin": (5837 / 15912)},
            {"name": "Angus North and Mearns", "challenger": "Conservative", "margin": (2472 / 13417)},
            {"name": "Angus South", "challenger": "Conservative", "margin": (4304 / 15622)},
            {"name": "Banffshire and Buchan Coast", "challenger": "Conservative", "margin": (6583 / 15802)},
            {"name": "Dundee City East", "challenger": "Labour", "margin": (10898 / 16509)},
            {"name": "Dundee City West", "challenger": "Labour", "margin": (8828 / 16070)},
        ],
        "other_seats": [
            {"name": "Aberdeenshire West", "winner": "Conservative", "margin": (900 / 12500)},
        ],
    },
    {
        "name": "Mid Scotland and Fife",
        "list_votes": {
            "SNP": 120128,
            "Conservative": 73293,
            "Labour": 51373,
            "LibDem": 20401,
            "Green": 17860,
        },
        "snp_seats": [
            {"name": "Clackmannanshire and Dunblane", "challenger": "Labour", "margin": (6721 / 14147)},
            {"name": "Cowdenbeath", "challenger": "Labour", "margin": (3041 / 13715)},
            {"name": "Dunfermline", "challenger": "Labour", "margin": (4558 / 14257)},
            {"name": "Kirkcaldy", "challenger": "Labour", "margin": (7395 / 16358)},
            {"name": "Mid Fife and Glenrothes", "challenger": "Labour", "margin": (8276 / 15555)},
            {"name": "Perthshire North", "challenger": "Conservative", "margin": (3336 / 16526)},
            {"name": "Pershire South and Kinross-shire", "challenger": "Conservative", "margin": (1422 / 15315)},
            {"name": "Stirling", "challenger": "Conservative", "margin": (6718 / 16303)},
        ],
        "other_seats": [
            {"name": "North East Fife", "winner": "LibDem", "margin": (3465 / 11463)},
        ],
    },
    {
        "name": "West Scotland",
        "list_votes": {
            "SNP": 135827,
            "Labour": 72544,
            "Conservative": 71528,
            "Green": 17218,
            "LibDem": 12097,
        },
        "snp_seats": [
            {"name": "Clydebank and Milngavie", "challenger": "Labour", "margin": (8432 / 16158)},
            {"name": "Cunninghame North", "challenger": "Conservative", "margin": (8724 / 16587)},
            {"name": "Cunninghame South", "challenger": "Labour", "margin": (5693 / 13416)},
            {"name": "Greenock and Inverclyde", "challenger": "Labour", "margin": (8230 / 17032)},
            {"name": "Paisley", "challenger": "Labour", "margin": (5199 / 14682)},
            {"name": "Renfrewshire North and West", "challenger": "Conservative", "margin": (7373 / 14718)},
            {"name": "Renfrewshire South", "challenger": "Labour", "margin": (4408 / 14272)},
            {"name": "Strathkelvin and Bearsden", "challenger": "Conservative", "margin": (8100 / 17060)},
        ],
        "other_seats": [
            {"name": "Dumbarton", "winner": "Labour", "margin": (109 / 13413)},
            {"name": "Eastwood", "winner": "Conservative", "margin": (1611 / 11322)},
        ],
    },
    {
        "name": "Glasgow",
        "list_votes": {
            "SNP": 111101,
            "Labour": 59151,
            "Conservative": 29533,
            "Green": 23398,
            "LibDem": 5850,
        },
        "snp_seats": [
            {"name": "Glasgow Anniesland", "challenger": "Labour", "margin": (6153 / 15007)},
            {"name": "Glasgow Cathcart", "challenger": "Labour", "margin": (9390 / 16200)},
            {"name": "Glasgow Kelvin", "challenger": "Green", "margin": (4048 / 10964)},
            {"name": "Glasgow Maryhill and Springburn", "challenger": "Labour", "margin": (5602 / 13109)},
            {"name": "Glasgow Pollok", "challenger": "Labour", "margin": (6482 / 15316)},
            {"name": "Glasgow Provan", "challenger": "Labour", "margin": (4783 / 13140)},
            {"name": "Glasgow Shettleston", "challenger": "Labour", "margin": (7323 / 14198)},
            {"name": "Glasgow Southside", "challenger": "Labour", "margin": (9593 / 15287)},
            {"name": "Rutherglen", "challenger": "Labour", "margin": (3743 / 15222)},
        ],
        "other_seats": [
        ],
    },
    {
        "name": "Central Scotland",
        "list_votes": {
            "SNP": 129082,
            "Labour": 67103,
            "Conservative": 43602,
            "Green": 12722,
            "LibDem": 5015,
        },
        "snp_seats": [
            {"name": "Airdrie and Shotts", "challenger": "Labour", "margin": (6192 / 13954)},
            {"name": "Coatbridge and Chryston", "challenger": "Labour", "margin": (3779 / 13605)},
            {"name": "Cumbernauld and Kilsyth", "challenger": "Labour", "margin": (9478 / 17015)},
            {"name": "East Kilbride", "challenger": "Labour", "margin": (10979 / 19371)},
            {"name": "Falkirk East", "challenger": "Labour", "margin": (8312 / 16720)},
            {"name": "Falkirk West", "challenger": "Labour", "margin": (11280 / 18260)},
            {"name": "Hamilton, Larkhall and Stonehouse", "challenger": "Labour", "margin": (5437 / 13945)},
            {"name": "Motherwell and Wishaw", "challenger": "Labour", "margin": (6223 / 15291)},
            {"name": "Uddingston and Bellshill", "challenger": "Labour", "margin": (4809 / 14424)},
        ],
        "other_seats": [],
    },
    {
        "name": "Lothian",
        "list_votes": {
            "SNP": 118546,
            "Conservative": 74972,
            "Labour": 67991,
            "Green": 34551,
            "LibDem": 18479,
        },
        "snp_seats": [
            {"name": "Almond Valley", "challenger": "Labour", "margin": (8393 / 18475)},
            {"name": "Edinburgh Eastern", "challenger": "Labour", "margin": (5087 / 16760)},
            {"name": "Edinburgh Northern and Leith", "challenger": "Labour", "margin": (6746 / 17322)},
            {"name": "Edinburgh Pentlands", "challenger": "Conservative", "margin": (2456 / 13181)},
            {"name": "Linlithgow", "challenger": "Labour", "margin": (9335 / 19362)},
            {"name": "Midlothian North and Musselburgh", "challenger": "Labour", "margin": (7035 / 16948)},
        ],
        "other_seats": [
            {"name": "Edinburgh Central", "winner": "Conservative", "margin": (610 / 9789)},
            {"name": "Edinburgh Southern", "winner": "Labour", "margin": (1123 / 12474)},
            {"name": "Edinburgh Western", "winner": "LibDem", "margin": (2960 / 13685)},
        ],
    },
    {
        "name": "South Scotland",
        "list_votes": {
            "SNP": 120217,
            "Conservative": 100753,
            "Labour": 56072,
            "Green": 14773,
            "LibDem": 11775,
        },
        "snp_seats": [
            {"name": "Carrick, Cumnock and Doon Valley", "challenger": "Labour", "margin": (6006 / 14690)},
            {"name": "Clydesdale", "challenger": "Conservative", "margin": (5979 / 14821)},
            {"name": "Kilmarnock and Irvine Valley", "challenger": "Labour", "margin": (11194 / 19047)},
            {"name": "Midlothian South, Tweeddale and Lauderdale", "challenger": "Conservative", "margin": (5868 / 16031)},
        ],
        "other_seats": [
            {"name": "Ayr", "winner": "Conservative", "margin": (750 / 15433)},
            {"name": "Dumfriesshire", "winner": "Conservative", "margin": (1230 / 12306)},
            {"name": "East Lothian", "winner": "Labour", "margin": (1127 / 13202)},
            {"name": "Ettrick, Roxburgh and Berwickshire", "winner": "Conservative", "margin": (7736 / 10521)},
            {"name": "Galloway and West Dumfries", "winner": "Conservative", "margin": (1514 / 13013)},
        ],
    },
]
const SNP_CONSTITUENCY_SHARE = 1059898 / 2279154;
const TOTAL_PRO_INDY_SHARE = (953587 + 150426) / 2285752;

function update() {
    var snp_constituency_delta = parseFloat(document.getElementById("snp-constituency-delta").value);
    var list_split = parseFloat(document.getElementById("list-split").value);

    document.getElementById("snp-constituency-delta-label").textContent = snp_constituency_share_label(snp_constituency_delta);
    document.getElementById("list-split-label").textContent = list_split_label(list_split);

    var seat_totals = {"SNP": 0, "Conservative": 0, "Labour": 0, "Green": 0, "LibDem": 0};
    REGIONS.forEach(region => {
        var region_seats = update_region(region, snp_constituency_delta, list_split);
        for (var party in region_seats) {
            seat_totals[party] += region_seats[party];
        }
    });

    var snp_majority = 2 * seat_totals.SNP - 129;
    var pro_indy_majority = snp_majority + 2 * seat_totals.Green;
    var snp_row = document.getElementById("snp-majority");
    var pro_indy_row = document.getElementById("pro-indy-majority");

    if (snp_majority > 0) {
        snp_row.classList = "majority-ok";
        snp_row.children[0].children[0].classList = "glyphicon glyphicon-ok";
    } else {
        snp_row.classList = "majority-no";
        snp_row.children[0].children[0].classList = "glyphicon glyphicon-remove";
    }
    if (pro_indy_majority > 0) {
        pro_indy_row.classList = "majority-ok";
        pro_indy_row.children[0].children[0].classList = "glyphicon glyphicon-ok";
    } else {
        pro_indy_row.classList = "majority-no";
        pro_indy_row.children[0].children[0].classList = "glyphicon glyphicon-remove";
    }
    snp_row.children[2].textContent = snp_majority;
    pro_indy_row.children[2].textContent = pro_indy_majority;

    var chart_circles = document.getElementById("seat-chart").children;
    var seat_no = 0;
    var parties = ["Green", "SNP", "Labour", "LibDem", "Conservative"];
    for (var i in parties) {
        var party = parties[i];
        for (var j=0; j<seat_totals[party]; j++) {
            chart_circles[seat_no].classList = party;
            seat_no++;
        }
    }

    seat_totals = sorted(seat_totals);
    var national_totals = document.getElementById("national-totals").children[0];
    for (var i in seat_totals) {
        var row = national_totals.children[i].children;
        row[0].innerHTML = visual_party(seat_totals[i][0]);
        row[1].textContent = seat_totals[i][0];
        row[2].children[0].textContent = seat_totals[i][1];
    }
}

function update_region(region, snp_constituency_delta, list_split) {
    var constituency_seats_before = {"SNP": region.snp_seats.length, "Conservative": 0, "Labour": 0, "Green": 0, "LibDem": 0};
    region.other_seats.forEach(constituency => {
        constituency_seats_before[constituency.winner] += 1;
    });

    var constituency_seats_after = {};
    Object.assign(constituency_seats_after, constituency_seats_before);
    region.other_seats.forEach(constituency => {
        if (snp_constituency_delta > constituency.margin) {
            constituency_seats_after.SNP += 1;
            constituency_seats_after[constituency.winner] -= 1;
        }
    });
    region.snp_seats.forEach(constituency => {
        if ((-1 * snp_constituency_delta) > constituency.margin) {
            constituency_seats_after.SNP -= 1;
            constituency_seats_after[constituency.challenger] += 1;
        }
    });

    var constituency_label = '<strong>Constituency seats</strong>: ';
    constituency_label += visual_seats(constituency_seats_after);
    document.getElementById(region.name + "-constituencies").innerHTML = constituency_label;

    var list_votes = reassign_list_votes(region.list_votes, list_split);
    var total_list_votes = 0;
    for (var party in list_votes) {
        total_list_votes += list_votes[party];
    }

    var region_seats = {};
    Object.assign(region_seats, constituency_seats_after);
    tbody = document.getElementById(region.name + "-list-seats").children[1];
    var threshold;
    for (var i=0; i<7; i++) {
        var winner = "";
        var winning_numerator = 0;
        var winning_denominator = 1;
        var winning_total = 0;
        for (var party in list_votes) {
            var numerator = list_votes[party];
            var denominator = 1 + region_seats[party];
            var total = numerator / denominator;
            if (total > winning_total) {
                winner = party;
                winning_total = total;
                winning_numerator = numerator;
                winning_denominator = denominator;
            }
        }
        region_seats[winner] += 1;

        var row = tbody.children[i];
        row.children[0].innerHTML = visual_party(winner);
        row.children[1].textContent = winning_numerator.toLocaleString() + " / " + winning_denominator;
        row.children[3].textContent = Math.round(winning_total).toLocaleString();
        threshold = winning_total;

        if (i == 6) {
            ["SNP", "Green"].forEach(party => {
                if (winner != party) {
                    var denominator = 1 + region_seats[party];
                    var shortfall = winning_total * denominator - list_votes[party];
                    console.log(party + " needed " + shortfall + " more votes to take the last seat from " + winner);
                }
            });
        }
    }

    var tbody = document.getElementById(region.name + "-list-votes").children[1];
    var labels = document.getElementById(region.name + "-list-vote-labels").children;
    labels[10].textContent = "Threshold: " + Math.round(threshold).toLocaleString();
    var chart = '';
    var sorted_list_votes = sorted(list_votes);
    var most_votes;
    for(var i in sorted_list_votes) {
        var row = tbody.children[i].children;
        var party = sorted_list_votes[i][0];
        var votes = sorted_list_votes[i][1];
        if (i == 0) {
            most_votes = votes;
        }
        chart += render_bar(i, party, votes, constituency_seats_after[party], most_votes, threshold);
        row[0].innerHTML = visual_party(party);
        row[1].textContent = votes.toLocaleString();
        labels[i * 2].textContent = votes.toLocaleString();
        row[2].textContent = percentage(votes / total_list_votes);
        labels[i * 2 + 1].textContent = percentage(votes / total_list_votes);
    }
    document.getElementById(region.name + "-chart").innerHTML = chart;

    var total_seats_label = '<strong>Total seats</strong>: ';
    total_seats_label += visual_seats(region_seats);
    document.getElementById(region.name + "-total-seats").innerHTML = total_seats_label;

    return region_seats;
}

function render_bar(index, party, votes, constituency_seats, most_votes, threshold) {
    var bar = '';
    for (var i=0; i * threshold <= votes; i++) {
        var class_list = party + " bar-segment";
        if (constituency_seats > i) {
            class_list += ' seat-already-awarded';
        }
        if (votes < (i + 1) * threshold) {
            class_list += ' insufficient';
        }
        bar += '<rect width="50" x="' + (index * 60 + 5) + '" ';
        bar += 'height="' + (200 * Math.min(threshold, votes - (i * threshold)) / most_votes) + '" ';
        bar += 'y="' + (230 - (200 * Math.min((i + 1) * threshold, votes) / most_votes)) + '" ';
        bar += 'class="' + class_list + '" />';
    }
    return bar;
}

function enable_constituency_slider() {
    document.getElementById("constituency-slider").classList.remove("hidden");
    document.getElementById("constituency-slider-button").classList.add("hidden");
    document.getElementById("snp-constituency-delta").focus();
}

function add_th(number) {
    if (number == 1) {
        return "1st";
    }
    if (number == 2) {
        return "2nd";
    }
    if (number == 3) {
        return "3rd";
    }
    return number + "th";
}

function actual_list_split() {
    var greens = 0;
    var snp = 0;
    REGIONS.forEach(region => {
        greens += region.list_votes.Green;
        snp += region.list_votes.SNP;
    });
    return greens / (greens + snp);
}

function reassign_list_votes(list_votes, split) {
    var reassigned = {};
    Object.assign(reassigned, list_votes);

    var actual_split = actual_list_split();
    if (split == actual_split) {
        return reassigned;
    }

    var region_split = list_votes.Green / (list_votes.Green + list_votes.SNP);
    var new_split;
    if (split > actual_split) {
        var increase = (split - actual_split) / (1 - actual_split);
        new_split = region_split + (1 - region_split) * increase;
    } else {
        var decrease = (actual_split - split) / actual_split;
        new_split = region_split * (1 - decrease);
    }

    green_multiplier = new_split / region_split;
    snp_multiplier = (1 - new_split) / (1 - region_split);
    reassigned.SNP = Math.round(list_votes.SNP * snp_multiplier);
    reassigned.Green = Math.round(list_votes.Green * green_multiplier);

    return reassigned;
}

function snp_constituency_share_label(delta) {
    var snp_vote = SNP_CONSTITUENCY_SHARE * (1 + delta);
    var other_vote = 1 - SNP_CONSTITUENCY_SHARE;
    return "SNP constituency vote share: " + percentage(snp_vote / (snp_vote + other_vote));
}

function list_split_label(list_split) {
    var green = list_split * TOTAL_PRO_INDY_SHARE;
    var snp = (1 - list_split) * TOTAL_PRO_INDY_SHARE;
    return "Green/SNP list vote split: ( " + percentage(green) + " / " + percentage(snp) + " ) ";
}

function percentage(value) {
    return (value * 100).toFixed(1) + '%';
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

function visual_seats(seats_map) {
    var string = "";
    sorted(seats_map).forEach(party_seats => {
        for (var i=0; i<party_seats[1]; i++) {
            string += visual_party(party_seats[0]) + " ";
        }
    });
    return string;
}

function visual_party(party) {
    return '<span class="' + party + '">' + "\u2588</span>";
}

var REGION_HTML = '<h3>REGION_NAME</h3><p id="REGION_NAME-constituencies"></p>';
REGION_HTML += '<div class="row hidden"><div class="col-sm-7">';
REGION_HTML += '<table class="table" id="REGION_NAME-list-seats">';
REGION_HTML += '<thead><tr><th colspan=4>List Seats</th></tr></thead><tbody>';
for(var i=0; i<7; i++) {
    REGION_HTML += '<tr><td></td><td></td><td>=</td><td></td></tr>';
}
REGION_HTML += '</tbody></table></div>';
REGION_HTML += '<div class="col-sm-5"><table class="table" id="REGION_NAME-list-votes">';
REGION_HTML += '<thead><tr><th colspan=3>List Votes</th></tr></thead><tbody>';
for(var i=0; i<5; i++) {
    REGION_HTML += '<tr><td></td><td></td><td></td></tr>';
}
REGION_HTML += '</tbody></table></div>';
REGION_HTML += '</div>';
REGION_HTML += '<svg width="300" height="320"><g id="REGION_NAME-chart"></g>';
REGION_HTML += '<g id="REGION_NAME-list-vote-labels">';
REGION_HTML += '<text x="30" y="250" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="30" y="270" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="90" y="250" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="90" y="270" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="150" y="250" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="150" y="270" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="210" y="250" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="210" y="270" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="270" y="250" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="270" y="270" class="list-votes-chart-label"></text>';
REGION_HTML += '<text x="150" y="295" style="font-size:16px;text-align:center;text-anchor:middle;"></text>';
REGION_HTML += '<text x="150" y="25" style="font-size:16px;font-weight:bold;text-align:center;text-anchor:middle;">Additional member results</text>';
REGION_HTML += '</g></svg>';
REGION_HTML += '<p id="REGION_NAME-total-seats"></p>';

function set_up() {
    var row = document.getElementById("region-results");
    for (var i in REGIONS) {
        var column = document.createElement("div");
        var div = document.createElement("div");
        column.classList = "col-md-6 col-sm-12 col-xs-12";
        div.classList = "region";
        div.id = REGIONS[i].name;
        row.appendChild(column);
        column.appendChild(div);
        div.innerHTML = REGION_HTML.replace(/REGION_NAME/g, REGIONS[i].name);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    set_up();
    document.getElementById("list-split").value = actual_list_split();
    update();
});
