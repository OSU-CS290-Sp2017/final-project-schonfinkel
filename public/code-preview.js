window.highlightingPreview = (function() {
"use strict";

/******** Polyfill ********/
if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        if (count < 1) {
            return "";
        }
        let result = "";
        let pattern = this.valueOf();
        while (count > 1) {
            if (count & 1) {
                result += pattern;
            }
            count >>= 1;
            pattern += pattern;
        }
        return result + pattern;
    };
}

/* Ordered by precedence */
const lineFeed = /^\n+/;
const charLiteral = /^'\\?[^\n]'/;
const strLiteral = /^"[^\n]*?"/;
const blockComment = /^{-[\s\S]*?-}/;
const lineComment = /^--[^\n]*/;
const spacing = /^ +/;
const rightArr = /^→/;
const leftArr = /^←/;
const do_ = /^⟥/;
const doubleDots = /^\.\.(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
const numericLiteral = /^[0-9]*\.?[0-9]+/;
const eqBinding = /^=(?=[^≪!#\$%&*+./:<=>?@\\^|~-])/;
const semicolon = /^;/;
const backtick = /^`/;
const leftParen = /^\(/;
const rightParen = /^\)/;
const leftCurBracket = /^{/;
const rightCurBracket = /^}/;
const leftSqBracket = /^\[/;
const rightSqBracket = /^\]/;
const leftAngBracket = /^⟨/;
const rightAngBracket = /^⟩/;
const comma = /^,/;
const asAt = /^@(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
const vert = /^\|/;
const brokenVert = /^¦/;
const unaryMinus = /^-(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
const underscore = /^_/;
const specialFn = /^[⊛≡≢¬⊙⩖⤔∈⁂⅋∩∪Σ↵⊢∀∃¡Δ×⊠÷⋄]/;
const infixFn = /^(\^≫|≫|≫=|≫>|≫\^|\^≪|≪<|≪\^|=≪|⌊|⌊\^|⌊#|⌊!|[!#\$%&*+./:<=>?@\\^|~\-]+)/;
const upperId = /^[A-Z]+/;
const lowerId = /^[a-z]+/;
const tokenTypes =
    { lineFeed
    , charLiteral
    , strLiteral
    , blockComment
    , lineComment
    , spacing
    , rightArr
    , leftArr
    , do_
    , doubleDots
    , numericLiteral
    , eqBinding
    , semicolon
    , backtick
    , leftParen
    , rightParen
    , leftCurBracket
    , rightCurBracket
    , leftSqBracket
    , rightSqBracket
    , leftAngBracket
    , rightAngBracket
    , comma
    , asAt
    , vert
    , brokenVert
    , unaryMinus
    , underscore
    , specialFn
    , infixFn
    , upperId
    , lowerId
    };


function parse(code) {
    const out = [];

    while (code.length > 0) {
        let matched = false;

        for (const tokenType in tokenTypes) {
            const regex = tokenTypes[tokenType];
            const match = regex.exec(code);

            if (match) {
                const matchStr = match[0];

                if (~["lineFeed", "spacing"].indexOf(tokenType)) {
                    out.push(document.createTextNode(matchStr));
                } else {
                    const span_ = document.createElement("span");
                    span_.appendChild(document.createTextNode(matchStr));
                    span_.classList.add(tokenType);
                    out.push(span_);
                }

                code = code.slice(matchStr.length);
                matched = true;
                break;
            }
        }

        if (!matched) {
            let leadingContext = "";
            for (;;) {
                if (leadingContext.length > 18) {
                    break;
                }
                const popped = out.pop();
                if (popped === undefined) {
                    break;
                }
                if (popped.innerText === undefined) {
                    if (~popped.wholeText.indexOf(" ")) {
                        leadingContext = popped.wholeText + leadingContext;
                    } else {
                        break;
                    }
                } else {
                    leadingContext = popped.innerText + leadingContext;
                }
            }
            leadingContext = leadingContext.slice(0, 18);
            let err = "Encountered unexpected character: ";
            err += code[0];
            err += "\nContext:\n\n";
            err += " ".repeat(leadingContext.length);
            err += "\u2193\n";
            err += leadingContext;
            err += code.slice(0, 99 - leadingContext.length) + "\n";

            throw err;
        }
    }

    return out;
}

/*********************************************************************/

const editorArea = document.getElementById("editor-area");
const codepage =
    "⊛→←≡≢¬⊙⩖⤔∈\n⁂⅋≫≪∩∪Σ↵⊢¦∀∃⟨⟩¡⟥Δ⌊×⊠÷ !\"#$%&'()*+,-./0123456789:;<=>" +
    "?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⋄";

function update() {
    const hp = document.getElementById("highlighting-preview");

    const code = editorArea.value;

    try {
        const parsed = parse(code);
        hp.innerHTML = "";
        parsed.forEach(p => {
            hp.appendChild(p);
        });
    } catch (err) {
        hp.innerHTML = "";
        hp.appendChild(document.createTextNode("" + err));
    }

    const bc = document.getElementById("byte-count");

    let bytecount = 0;
    code.split("").forEach(chr => {
        if (~codepage.indexOf(chr)) {
            bytecount++;
        } else {
            bytecount += 2;
        }
    });

    bc.innerHTML = "";
    bc.appendChild(document.createTextNode("Current byte count: " + bytecount));
}

editorArea.addEventListener("input", update);

return { update };

})();
