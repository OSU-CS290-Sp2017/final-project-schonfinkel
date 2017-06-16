window.insertAtCursor = (function() {

"use strict";


function insertAtCursor(field, val) {
    if (field.value === undefined) {
        field.value = "";
    }

    if (document.selection) {
        field.focus();
        sel = document.selection.createRange();
        sel.text = val;
    } else if (field.selectionStart || +field.selectionStart === 0) {
        const startPos = field.selectionStart;
        const endPos = field.selectionEnd;
        field.value =
            field.value.substring(0, startPos) +
                val +
                field.value.substring(endPos, field.value.length);
        field.selectionStart = startPos + val.length;
        field.selectionEnd = startPos + val.length;
    } else {
        field.value += val;
    }
}

function postSnippet(author, code, description, title, callback) {
    const postRequest = new XMLHttpRequest();
    postRequest.open("POST", "/editor/addSnippet");
    postRequest.setRequestHeader("Content-Type", "application/json");

    postRequest.addEventListener(
        "load",
        event => callback(
            event.target.status === 200 ?
                undefined :
                event.target.response
        )
    );

    const postBody = {
        author,
        code,
        description,
        title
    };
    postRequest.send(JSON.stringify(postBody));
}

function modalAlert(type, ...msgLines) {
    const types = ["success", "info", "warning", "danger"];
    const ma = document.getElementById("modal-alert");

    ma.innerHTML = "";
    types.forEach(t =>
        t === type ?
            ma.classList.add("alert-" + t) :
            ma.classList.remove("alert-" + t)
    );
    ma.appendChild(document.createTextNode(msgLines[0]));
    msgLines.slice(1).forEach(l => {
        ma.appendChild(document.createElement("br"));
        ma.appendChild(document.createTextNode(l));
    });

    ma.classList.remove("hide");
}


$(".char-pad-button").click(ev => {
    ev.preventDefault();

    const editorArea = document.getElementById("editor-area");
    insertAtCursor(editorArea, ev.target.textContent);

    highlightingPreview.update();
});

$("#highlighting-preview-toggle").click(ev => {
    ev.preventDefault();

    $("#highlighting-preview-container").toggleClass("hide");
});

$("#compile-button").click(ev => {
    ev.preventDefault();

    const outputc = document.getElementById("output");
    const output = (() => {
        try {
            return schtohs.compile(
                document.getElementById("editor-area").value
            );
        } catch (err) {
            return "" + err;
        }
    })();

    outputc.innerHTML = "";
    outputc.appendChild(document.createTextNode(output));
});

$("#save-snippet-modal").on(
    "shown.bs.modal",
    () => $("#submitter-name").focus()
);

$("#description-text").on(
    "input",
    () => $("#character-count").text(
        $("#description-text").val().length + "/1000"
    )
);

$("#save-snippet-button").click(ev => {
    ev.preventDefault();

    const author = document.getElementById("submitter-name").value;
    const code = document.getElementById("editor-area").value;
    const description = document.getElementById("description-text").value;
    const title = document.getElementById("fragment-name").value;

    if (!author || !author.trim()) {
        modalAlert(
            "danger",
            "It looks like your name is missing.",
            "Make sure to enter that, and try again."
        );
        return;
    }
    if (!code || !code.trim()) {
        modalAlert(
            "danger",
            "It looks like you've not entered any code.",
            "Make sure your code is there, and try again."
        );
        return;
    }
    if (!description || !description.trim()) {
        modalAlert(
            "danger",
            "It looks like you've not entered a description.",
            "Make sure your description is there, and try again."
        );
        return;
    }
    if (!title || !title.trim()) {
        modalAlert(
            "danger",
            "It looks like your code snippet's title is missing.",
            "Make sure to enter that, and try again."
        );
        return;
    }

    const author_ = author.trim();
    const description_ = description.trim();
    const title_ = title.trim();

    if (author_.length > 24) {
        modalAlert(
            "danger",
            "Your name must not exceed 24 characters."
        );
        return;
    }
    if (code.length > 5000) {
        modalAlert(
            "danger",
            "Woah, there! That's not exactly a \"snippet\".",
            "Your code may not exceed 5000 bytes."
        );
        return;
    }
    if (description_.length > 1000) {
        modalAlert(
            "danger",
            "Your snippet's description must not exceed 1000 characters."
        );
        return;
    }
    if (title_.length > 36) {
        modalAlert(
            "danger",
            "Your snippet's title must not exceed 36 characters."
        );
        return;
    }

    postSnippet(author_, code, description_, title_, err =>
        err ?
            modalAlert(
                "danger",
                "Unable to save snippet. Got this error:",
                "",
                "" + err
            ) :
            modalAlert("success", "Successfully submitted code snippet!")
    );
});

$("#save-snippet-modal").on("hidden.bs.modal", () => {
    const ma = document.getElementById("modal-alert");

    ma.classList.add("hide");
    ma.innerHTML = "";
});

document.addEventListener(
    "DOMContentLoaded",
    () => highlightingPreview.update()
);


return insertAtCursor;

})();
