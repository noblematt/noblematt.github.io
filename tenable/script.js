
var lzma = new LZMA("/lib/lzma_worker.js");

var game_state = {
    "question": "",
    "answers": [],
    "clues": [],
    "contexts": [],
    "players": [],
    "attempts": [],
    "started": false,
    "game_over": false,
};

function initialise(data) {
    Object.assign(game_state, data);
    document.getElementById("question").value = game_state.question;
    for (i=0; i<10; i++) {
        document.getElementById(i + 1).value = game_state.answers[i];
        document.getElementById("clue" + (i + 1)).value = game_state.clues[i] || "";
        document.getElementById("context" + (i + 1)).value = game_state.contexts[i] || "";
    }
    document.getElementById("players").value = game_state.players.join(",");
    if (game_state.started) {
        start_game();
        for (i=0; i<game_state.attempts.length; i++) {
            var answer_index = -1;
            var player_index = i % game_state.players.length;
            var value = answer_value(i);
            for (var j=0; j<10; j++) {
                if (game_state.answers[j].trim().toLowerCase() == game_state.attempts[i]) {
                    answer_index = j;
                    break;
                }
            }
            if (answer_index == -1) {
                game_state.incorrect.push(i);
            } else {
                var element = document.getElementById("answer" + (answer_index + 1));
                element.textContent = game_state.answers[answer_index];
                if (game_state.contexts[answer_index]) {
                    element.textContent += " (" + game_state.contexts[answer_index] + ")";
                }
                element.classList.add("filled-answer");
                game_state.found_answers[answer_index] = true;
                game_state.scores[player_index] += value;
            }
        }
        update_scores_table();
    }
    if (game_state.game_over) {
        document.getElementById("answer").disabled = true;
    }
}

function start_game() {
    game_state.started = true;
    game_state.incorrect = [];
    game_state.scores = [];
    game_state.found_answers = [];
    for (var i=0; i<10; i++) {
        game_state.found_answers.push(false);
        if (game_state.clues[i]) {
            document.getElementById("answer" + (i + 1)).textContent = game_state.clues[i];
        }
    }
    for (var i=0; i<game_state.players.length; i++) {
        game_state.scores.push(0);
    }
    document.getElementById("question-def").classList.add("hidden");
    document.getElementById("question-header").textContent = game_state.question;
    document.getElementById("play").classList.remove("hidden");
    document.getElementById("answer").focus();
    initialise_scores_table();
    update_url();
}

function update_question_def() {
    game_state.question = document.getElementById("question").value;
    game_state.players = document.getElementById("players").value.split(",");
    game_state.answers = [];
    game_state.clues = [];
    game_state.contexts = [];
    for (var i=0; i<10; i++) {
        game_state.answers.push(document.getElementById(i + 1).value);
        game_state.clues.push(document.getElementById("clue" + (i + 1)).value);
        game_state.contexts.push(document.getElementById("context" + (i + 1)).value);
    }
    update_url();
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

function update_url(refresh) {
    lzma.compress(JSON.stringify(game_state), 1, function(compressed, error) {
        if (error) {
            alert("Failed to compress data: "+error);
            return;
        }

        var reader = new FileReader();
        reader.onload = function(){
            var base64 = reader.result.substr(reader.result.indexOf(",")+1);
            var url = '#' + base64;
            window.location.replace(url);
            if (refresh) {
                window.location.reload();
            }
        };
        reader.readAsDataURL(new Blob([new Uint8Array(compressed)]));
    });
}

function tower_complete(n) {
    var i;
    for (i=0; i<n; i++) {
        if (!game_state.found_answers[i]) {
            return false;
        }
    }
    return true;
}

function answer_value(index, n_players) {
    n_players = n_players || game_state.players.length;
    var i;
    var value = 1;
    for (i=0; i<game_state.incorrect.length; i++) {
        if (game_state.incorrect[i] > index - n_players) {
            value += 1;
        }
    }
    return value;
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

async function submit_answer() {
    if (game_state.game_over) {
        var i;
        for (i=10; i>0; i--) {
            if (!game_state.found_answers[i - 1]) {
                game_state.found_answers[i - 1] = true;
                document.getElementById("answer" + i).textContent = game_state.answers[i - 1];
                if (game_state.contexts[i - 1]) {
                    document.getElementById("answer" + i).textContent += " (" + game_state.contexts[i - 1] + ")";
                }
                return;
            }
        }
        return;
    }

    var answer_input = document.getElementById("answer");
    var answer = answer_input.value.trim().toLowerCase();
    answer_input.value = "";
    answer_input.disabled = true;
    if (!answer) {
        alert("Please provide an answer");
    }
    else if (game_state.attempts.includes(answer)) {
        alert("Answer already given");
    }
    else {
        await provide_answer(answer);
        update_scores_table();
        update_url();
    }
    if (!game_state.game_over) {
        answer_input.disabled = false;
    }
    answer_input.focus();
}

async function provide_answer(answer) {
    game_state.attempts.push(answer);
    for (var j=9; j>=0; j--) {
        if (game_state.answers[j].trim().toLowerCase() == answer) {
            document.getElementById("sound-correct").play();
            j = 0;
        } else {
            var highlight_element = document.getElementById("answer" + (j + 1));
            highlight_element.classList.add("wrong-answer");
            if (tower_complete(j)) {
                document.getElementById("sound-wrong").play();
                j = 0
            } else {
                document.getElementById("sound-maybe").play();
            }
            await sleep(700);
            highlight_element.classList.remove("wrong-answer");
        }
    }
    var i = game_state.attempts.length - 1;
    var answer_index = -1;
    var player_index = i % game_state.players.length;
    var value = answer_value(i);
    for (var j=0; j<10; j++) {
        if (game_state.answers[j].trim().toLowerCase() == game_state.attempts[i]) {
            answer_index = j;
            break;
        }
    }
    if (answer_index == -1) {
        game_state.incorrect.push(i);
    } else {
        var element = document.getElementById("answer" + (answer_index + 1));
        element.textContent = game_state.answers[answer_index];
        if (game_state.contexts[answer_index]) {
            element.textContent += " (" + game_state.contexts[answer_index] + ")";
        }
        element.classList.add("filled-answer");
        game_state.found_answers[answer_index] = true;
        game_state.scores[player_index] += value;
    }
}

function initialise_scores_table() {
    var scores_table = document.getElementById("scores");
    for (i=0; i<game_state.players.length; i++) {
        var row = scores_table.insertRow(i);
        row.insertCell(0).textContent = game_state.players[i];
        row.insertCell(1).textContent = game_state.scores[i];
    }
}

function update_scores_table() {
    var i = game_state.attempts.length;
    if (answer_value(i, game_state.players.length + 1) > game_state.players.length) {
        game_state.game_over = true;
        document.getElementById("answer-label").textContent = "Round over due to too many incorrect answers";
        document.getElementById("submit-answer").value = "Reveal answer";
    } else if (tower_complete(10)){
        game_state.game_over = true;
        document.getElementById("answer-label").textContent = "Tower complete - well done everyone!";
        document.getElementById("submit-answer").diabled = true;
    } else {
        var value = answer_value(i);
        var label = game_state.players[i % game_state.players.length] + "'s guess for " + value + " point";
        if (value > 1) {
            label += "s";
        }
        document.getElementById("answer-label").textContent = label;
    }

    var scores_table = document.getElementById("scores");
    for (i=0; i<game_state.players.length; i++) {
        scores_table.rows[i].cells[1].textContent = game_state.scores[i];
    }
}

function go_back() {
    game_state.attempts.pop();
    game_state.game_over = false;
    game_state.scores = [];
    update_url(true);
}
