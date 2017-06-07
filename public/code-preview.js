highlightingPreview = (function() {
"use strict";

if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        if (count < 1) {
            return "";
        }
        var result = "";
        var pattern = this.valueOf();
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
var lineFeed = /^\n+/;
var charLiteral = /^'\\?[^\n]'/;
var strLiteral = /^"[^\n]*?"/;
var blockComment = /^{-[\s\S]*?-}/;
var lineComment = /^--[^\n]*/;
var spacing = /^ +/;
var rightArr = /^→/;
var leftArr = /^←/;
var do_ = /^⟥/;
var doubleDots = /^\.\.(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
var numericLiteral = /^[0-9]*\.?[0-9]+/;
var eqBinding = /^=(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
var semicolon = /^;/;
var backtick = /^`/;
var leftParen = /^\(/;
var rightParen = /^\)/;
var leftCurBracket = /^{/;
var rightCurBracket = /^}/;
var leftSqBracket = /^\[/;
var rightSqBracket = /^\]/;
var leftAngBracket = /^⟨/;
var rightAngBracket = /^⟩/;
var comma = /^,/;
var asAt = /^@(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
var vert = /^\|/;
var brokenVert = /^¦/;
var unaryMinus = /^-(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
var underscore = /^_/;
var specialFn = /^[⊛≡≢¬⊙⩖⤔∈⁂⅋∩∪Σ↵⊢∀∃¡Δ×⊠÷⋄]/;
var infixFn = /^(\^≫|≫|≫=|≫>|≫\^|\^≪|≪<|≪\^|=≪|⌊|⌊\^|⌊#|⌊!|[!#\$%&*+./:<=>?@\\^|~\-]+)/;
var upperId = /^[A-Z]+/;
var lowerId = /^[a-z]+/;
var tokenTypes =
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
    var out, matched, tokenType, regex, match;
    var matchStr, span_, err, i, popped, leadingContext;

    out = [];

    while (code.length > 0) {
        matched = false;

        for (tokenType in tokenTypes) {
            regex = tokenTypes[tokenType];
            match = regex.exec(code);

            if (match) {
                matchStr = match[0];

                if (~["lineFeed", "spacing"].indexOf(tokenType)) {
                    out.push(document.createTextNode(matchStr));
                } else {
                    span_ = document.createElement("span");
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
            leadingContext = "";
            for (;;) {
                if (leadingContext.length > 18) {
                    break;
                }
                popped = out.pop();
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
            err = "Encountered unexpected character: ";
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

var editorArea = document.getElementById("editor-area");
var codepage =
    "⊛→←≡≢¬⊙⩖⤔∈\n⁂⅋≫≪∩∪Σ↵⊢¦∀∃⟨⟩¡⟥Δ⌊×⊠÷ !\"#$%&'()*+,-./0123456789:;<=>" +
    "?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⋄";

function update() {
    var hp, code, parsed, bc, bytecount;

    hp = document.getElementById("highlighting-preview");

    code = editorArea.value;

    try {
        parsed = parse(code);
        hp.innerHTML = "";
        parsed.forEach(function(p) {
            hp.appendChild(p);
        });
    } catch (err) {
        hp.innerHTML = "";
        hp.appendChild(document.createTextNode("" + err));
    }

    bc = document.getElementById("byte-count");

    bytecount = 0;
    code.split("").forEach(function(chr) {
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

return { update: update };

})();
