function insertAtCursor(field, val) {
    "use strict";
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

$(".char-pad-button").click(function(ev) {
    "use strict";
    ev.preventDefault();

    const editorArea = document.getElementById("editor-area");
    insertAtCursor(editorArea, ev.target.textContent);

    highlightingPreview.update();
});

$("#highlighting-preview-toggle").click(ev => {
    "use strict";
    ev.preventDefault();

    $("#highlighting-preview-container").toggleClass("hide");
});

$("#compile-button").click(ev => {
    "use strict";
    ev.preventDefault();

    const outputc = document.getElementById("output");
    let output;

    try {
        output = schtohs.compile(document.getElementById("editor-area").value);
    } catch (err) {
        output = "" + err;
    }

    outputc.innerHTML = "";
    outputc.appendChild(document.createTextNode(output));
});

$("#save-snippet-modal").on("shown.bs.modal", () => {
    "use strict";
    $("#submitter-name").focus();
});

$("#description-text").on("input", () => {
    "use strict";
    $("#character-count").text($("#description-text").val().length + "/1000");
});
