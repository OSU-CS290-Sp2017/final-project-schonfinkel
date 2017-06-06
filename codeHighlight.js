"use strict";


/* Ordered by precedence */
const lineFeed = /^\n+/;
const charLiteral = /^'\\?[^\n]'/;
const strLiteral = /^"[^\n]*?"/;
const blockComment = /^{-.*?-}/;
const lineComment = /^--[^\n]*/;
const spacing = /^ +/;
const rightArr = /^→/;
const leftArr = /^←/;
const do_ = /^⟥/;
const doubleDots = /^\.\.(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
const numericLiteral = /^[0-9]*\.?[0-9]+/;
const eqBinding = /^=(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
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
    let out = "";

    while (code.length > 0) {
        let matched = false;

        for (const tokenType in tokenTypes) {
            const regex = tokenTypes[tokenType];
            const match = regex.exec(code);

            if (match) {
                const matchStr = match[0];

                if (~["lineFeed", "spacing"].indexOf(tokenType)) {
                    out += matchStr;
                } else {
                    out += '<span class="';
                    out += tokenType;
                    out += '">';
                    out += matchStr;
                    out += "</span>";
                }

                code = code.slice(matchStr.length);
                matched = true;
                break;
            }
        }

        if (!matched) {
            console.log("Encountered unexpected character: " + code[0]);
            console.log("Context:\n");
            console.log("v");
            console.log(code.slice(0, 79));
            console.log("");
            throw "Failure parsing Sch code";
        }
    }

    return out;
}

module.exports = { parse: parse };
