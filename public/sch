#!/usr/bin/env node

"use strict";

const fs = require("fs");


const codepage =
    "⊛→←≡≢¬⊙⩖⤔∈\n⁂⅋≫≪∩∪Σ↵⊢¦∀∃⟨⟩¡⟥Δ⌊×⊠÷ !\"#$%&'()*+,-./0123456789:;<=>" +
    "?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⋄";

const specialFnMappings = {
    "⊛": "App.<*>",
    "≡": "P.==",
    "≢": "P./=",
    "¬": "P.not",
    "⊙": "`L.findIndices`",
    "⩖": "&!&!&",
    "⤔": "`M.mapM`",
    "∈": "`P.elem`",
    "⁂": "Arr.***",
    "⅋": "Arr.&&&",
    "∩": "`L.intersect`",
    "∪": "`L.union`",
    "Σ": "P.sum",
    "↵": "App.<$>",
    "⊢": "`L.partition`",
    "∀": "`P.all`",
    "∃": "`P.any`",
    "¡": "`L.genericIndex`",
    "Δ": "^-^-^",
    "×": "!>^<!",
    "⊠": "`L.zip`",
    "÷": "`P.div`",
    "⋄": "+:+:+"
};

const infixFnMappings = {
    "^≫": "Arr.^>>",
    "≫":  "M.>>",
    "≫=": "M.>>=",
    "≫>": "Arr.>>>",
    "≫^": "Arr.>>^",
    "^≪": "Arr.^<<",
    "≪<": "Arr.<<<",
    "≪^": "Arr.<<^",
    "=≪": "M.=<<",
    "⌊":  "P.floor",
    "⌊^": "P.ceiling",
    "⌊#": "P.round",
    "⌊!": "P.truncate",
    "$":  "P.$",
    "%":  "`P.mod`",
    "*":  "P.*",
    "+":  "P.+",
    ".":  "P..",
    "/":  "P./",
    ":":  "P.:",
    "<":  "P.<",
    ">":  "P.>",
    "^":  "P.^",
    "*>": "App.*>",
    "**": "P.**",
    "++": "P.++",
    "<=": "P.<=",
    "<$": "App.<$",
    "<*": "App.<*",
    "^^": "P.^^"
};

const upperIdMappings = {
    "A":  "L.filter",
    "AR": "Arr.arr",
    "B":  "L.sortBy",
    "BR": "L.break",
    "C":  "F.concat",
    "CG": "O.comparing",
    "CM": "O.compare",
    "CO": "P.cos",
    "CR": "P.curry",
    "CY": "L.cycle",
    "D":  "L.nub",
    "DR": "L.genericDrop",
    "DW": "L.dropWhile",
    "E":  "F.maximum",
    "ER": "P.error",
    "EV": "P.even",
    "EX": "P.exp",
    "F":  "L.zipWith",
    "FC": "unsafeFind",
    "FD": "F.find",
    "FH": "findIndex1",
    "FI": "L.findIndex",
    "FJ": "May.fromJust",
    "FL": "L.foldl1'",
    "FM": "May.fromMaybe",
    "FP": "P.flip",
    "FR": "F.foldr1",
    "FT": "P.fst",
    "G":  "F.minimum",
    "GC": "P.getChar",
    "GD": "P.gcd",
    "GL": "P.getLine",
    "H":  "P.toEnum",
    "I":  "F.null",
    "IE": "L.iterate",
    "IJ": "May.isJust",
    "IN": "May.isNothing",
    "IR": "P.interact",
    "J":  "L.tail",
    "K":  "L.genericTake",
    "L":  "L.genericLength",
    "LA": "L.last",
    "LG": "P.log",
    "LI": "P.lines",
    "LM": "P.lcm",
    "LU": "L.lookup",
    "LV": "unsafeLookup",
    "M":  "P.show",
    "MI": "mapWithIndices",
    "N":  "P.read",
    "NE": "F.notElem",
    "O":  "P.fromEnum",
    "OD": "P.odd",
    "P":  "P.print",
    "PI": "P.pi",
    "PR": "P.pred",
    "PS": "P.putStrLn",
    "PT": "P.putStr",
    "Q":  "subIndex",
    "QT": "P.quot",
    "R":  "L.reverse",
    "RC": "L.genericReplicate",
    "RF": "P.readFile",
    "RM": "P.rem",
    "RP": "L.repeat",
    "RT": "M.return",
    "S":  "L.sort",
    "SD": "P.snd",
    "SI": "P.sin",
    "SL": "L.scanl1",
    "SN": "L.span",
    "SP": "L.genericSplitAt",
    "SQ": "M.sequence",
    "SR": "L.scanr",
    "SS": "L.scanr1",
    "ST": "P.sqrt",
    "SU": "P.succ",
    "T":  "L.transpose",
    "TA": "P.tan",
    "U":  "L.intercalate",
    "UC": "P.uncurry",
    "UD": "P.undefined",
    "UL": "P.unlines",
    "UT": "P.until",
    "UW": "P.unwords",
    "UZ": "L.unzip",
    "V":  "L.scanl",
    "W":  "L.takeWhile",
    "WF": "P.writeFile",
    "WO": "P.words",
    "X":  "F.foldl'",
    "Y":  "F.foldr",
    "Z":  "L.permutations",
    "ZT": "L.zip3",
    "ZU": "L.unzip3",
    "ZW": "L.zipWith3"
};

const definitions = {
    "&!&!&": [`\
infixl 9 &!&!&
(&!&!&) :: P.Eq a => [a] -> [a] -> [[a]]
(&!&!&) l n =
    P.fst P.$ P.until (\\(_, l') -> P.null l') (\\(accu, rest) ->
        if L.genericTake needleLen rest P.== n then
            (accu P.++ [[]], L.genericDrop needleLen rest)
        else
            (L.init accu P.++ [P.last accu P.++ [P.head rest]], P.tail rest)) ([[]], l)
    where needleLen = L.genericLength n`, "L"],

    "!>^<!": [`\
infixl 7 !>^<!
(!>^<!) :: [a] -> [b] -> [(a, b)]
(!>^<!) xs ys = [(x, y) | x <- xs, y <- ys]`],

    "+:+:+": [`\
infixr 5 +:+:+
(+:+:+) :: [a] -> a -> [a]
(+:+:+) l a = l P.++ [a]`],

    "subIndex": [`\
subIndex :: P.Integral i => i -> a -> [a] -> [a]
subIndex i a (b:bs)
    | i P.< 0     = subIndex (L.genericLength bs P.+ i P.+ 1) a (b P.: bs)
    | i P.== 0    = a P.: bs
    | P.otherwise = b P.: subIndex (i P.- 1) a bs`, "L"],

    "unsafeFind": [`\
unsafeFind :: (a -> P.Bool) -> [a] -> a
unsafeFind p l =
    case L.find p l of
        P.Just a -> a
        _        -> P.undefined`, "L"],

    "findIndex1": [`\
findIndex1 :: (a -> P.Bool) -> [a] -> P.Int
findIndex1 p l =
    case L.findIndex p l of
        P.Just i -> i
        _        -> -1`, "L"],

    "unsafeLookup": [`\
unsafeLookup :: P.Eq a => a -> [(a, b)] -> b
unsafeLookup k m =
    case L.lookup k m of
        P.Just b -> b
        _        -> P.undefined`, "L"],

    "mapWithIndices": [`\
mapWithIndices :: P.Integral i => (a -> i -> b) -> [a] -> [b]
mapWithIndices f xs = P.zipWith f xs [0..]`],

    "enumFromThrough": [`\
enumFromThrough :: (P.Enum a, P.Ord a) => a -> a -> [a]
enumFromThrough x y
    | x P.<= y    = [x..y]
    | P.otherwise = [x,(P.pred x)..y]`]
};

/* Ordered by precedence */
const lineFeed = /^\n+/;
const charLiteral = /^'\\?[^\n]'/;
const strLiteral = /^"(\\.|[^"])*"/;
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
const regexes =
    [ lineFeed
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
    ];

const usage = `\
Usage:
======

sch -c <inputFile> [outputFile]    Compiles a Schönfinkel source
                                   file using the Schönfinkel
                                   codepage, outputting to an *.hs
                                   file or instead to the
                                   optionally supplied output file.

sch -u <inputFile> [outputfile]    Same as above, but uses Unicode
                                   (UTF-8) encoding instead.

For more info, visit https://github.com/AugmentedFifth/schonfinkel`;

function nameOutput(inputName) {
    const split = inputName.split(".");

    if (split.length > 1) {
        return split.slice(0, -1).join(".") + ".hs";
    }
    return inputName + ".hs";
}

function schDecode(buf) {
    const decoded = [];

    for (const b of buf) {
        decoded.push(codepage[b]);
    }

    return decoded.join("");
}


if (process.argv.length < 4) {
    console.log(usage);
    process.exit(1);
}

const flag = process.argv[2];
const inputFile = process.argv[3];
const outputFile =
    process.argv.length > 4 ?
        process.argv[4] :
        nameOutput(inputFile);

const unicode = (() => {
    switch (flag) {
        case "-c":
            return false;
        case "-u":
            return true;
        default:
            console.log(usage);
            process.exit(1);
    }
})();

const input = (() => {
    try {
        return fs.readFileSync(inputFile, unicode ? "utf8" : undefined);
    } catch (e) {
        if (e.code === "ENOENT") {
            console.log("There's no such file " + inputFile);
            process.exit(1);
        } else {
            throw e;
        }
    }
})();

let code =
    unicode ?
        input.split("").filter(c => ~codepage.indexOf(c)).join("") :
        schDecode(input);

// ============ Begin compilation ============ //

/* Tokenization */

const tokens = [[]];

while (code.length > 0) {
    let matched = false;

    for (const regex of regexes) {
        const match = regex.exec(code);
        if (match === null) {
            continue;
        }

        const matchStr = match[0];
        code = code.slice(matchStr.length);

        if (~matchStr.indexOf("\n")) {
            if (tokens[tokens.length - 1].length > 0) {
                tokens.push([]);
            }
        } else if (!spacing.test(matchStr)) {
            tokens[tokens.length - 1].push(matchStr);
        }

        matched = true;
        break;
    }

    if (!matched) {
        console.log("Encountered unexpected character: " + code[0]);
        console.log("Context:\n");
        console.log("    " + tokens[tokens.length - 1].join(" "));
        process.exit(1);
    }
}

if (tokens[tokens.length - 1].length < 1) {
    tokens.pop();
}

/* Hacky parsing directly into Haskell */

const imports = {
    "M":   "import qualified Control.Monad       as M",
    "App": "import qualified Control.Applicative as App",
    "Arr": "import qualified Control.Arrow       as Arr",
    "F":   "import qualified Data.Foldable       as F",
    "L":   "import qualified Data.List           as L",
    "May": "import qualified Data.Maybe          as May",
    "O":   "import qualified Data.Ord            as O"
};

let out = "import qualified Prelude             as P\n\n";
out += "import qualified System.Environment  as E\n\n";
const lineArray = [];
const calls = new Set();
const nakeds = [];
const range = /\[(.+?)\.\.(.+?)\]/;
function makeId(i) {
    return (i >= 26 ? makeId((i / 26 >> 0) - 1) : "") +
           "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0] +
           "9";
}

tokens.forEach(l => {
    const l_ = [];

    function failWithContext(msg, pinpoint) {
        if (pinpoint === undefined) {
            pinpoint = true;
        }

        if (msg) {
            console.log(msg);
        } else {
            console.log("Parsing failure.");
        }

        console.log("Context:\n");

        const context = l_.join(" ");
        if (pinpoint) {
            const trimmed =
                context.length <= 79 ?
                    context :
                    context.slice(context.length - 79);
            console.log(" ".repeat(trimmed.length - 1) + "\u2193");
            console.log(trimmed);
        } else {
            console.log(context);
        }

        process.exit(1);
    }

    let line = "";
    let naked = true;

    let backtickFlag = false;
    let doFlag = false;
    const matchStack = [];
    let awaitCaseOf = 0;
    let multiwayIfScope = 0;

    l.forEach(token => {
        l_.push(token);

        if (backtickFlag && !(upperId.test(token) || lowerId.test(token))) {
            failWithContext("Illegal use of backtick: `" + token);
        }

        if (
            charLiteral.test(token) ||
            strLiteral.test(token)  ||
            numericLiteral.test(token)
        ) {
            line += token + " ";
        } else if (blockComment.test(token) || spacing.test(token)) {
            line += " ";
        } else if (rightArr.test(token)) {
            if (multiwayIfScope > matchStack.length) {
                if (
                    line.length >= 8 &&
                    line.slice(line.length - 8) === "else if "
                ) {
                    line = line.slice(0, -3);
                    multiwayIfScope = 0;
                } else {
                    line += "then ";
                }
            } else {
                line += "-> ";
            }
        } else if (leftArr.test(token)) {
            line += "<- ";
        } else if (do_.test(token)) {
            line += "( do ";
            doFlag = true;
        } else if (".." === token) {
            line += ".. ";
        } else if ("=" === token) {
            line += "= ";
            if (!matchStack.length) {
                naked = false;
            }
        } else if (";" === token) {
            if (doFlag) {
                line += "; ";
            } else {
                line += " ";
            }
            // TODO: rest of the semicolon semantics? (?)
        } else if ("`" === token) {
            line += "`";
            backtickFlag = true;
        } else if ("(" === token) {
            line += "( ";
            matchStack.push("(");
        } else if (")" === token) {
            line += ") ";
            if (matchStack.pop() !== "(") {
                failWithContext("Mismatched parentheses.");
            }
        } else if ("{" === token) {
            line += "let ";
            matchStack.push("{");
        } else if ("}" === token) {
            line += "in ";
            if (matchStack.pop() !== "{") {
                failWithContext("Mismatched let blocks.");
            }
        } else if ("[" === token) {
            line += "[ ";
            matchStack.push("[");
        } else if ("]" === token) {
            line += "] ";
            if (matchStack.pop() !== "[") {
                failWithContext("Mismatched square brackets.");
            }
        } else if ("⟨" === token) {
            line += "( case ";
            matchStack.push("⟨");
            awaitCaseOf++;
        } else if ("⟩" === token) {
            line += ") ";
            if (matchStack.pop() !== "⟨") {
                failWithContext("Mismatched case blocks.");
            }
            if (awaitCaseOf > matchStack.filter(m => m === "⟨").length) {
                failWithContext("Incorrect case block syntax.");
            }
        } else if (comma.test(token)) {
            if (multiwayIfScope > matchStack.length) {
                line += "&%&%& ";
            } else {
                const peek =
                    matchStack.length > 0 ?
                        matchStack[matchStack.length - 1] :
                        undefined;

                if (!peek) {
                    failWithContext("Unexpected comma.");
                }
                switch (peek) {
                    case "{":
                        line += "; ";
                        break;
                    case "⟨":
                        line += "-> ; ";
                        break;
                    default:
                        line += ", ";
                }
            }
        } else if ("@" === token) {
            line += "@ ";
        } else if ("|" === token) {
            if (!multiwayIfScope) {
                line += "if ";
                multiwayIfScope = matchStack.length + 1;
            } else {
                line += "else if ";
            }
        } else if ("¦" === token) {
            const peek =
                matchStack.length > 0 ?
                    matchStack[matchStack.length - 1] :
                    "";

            switch (peek) {
                case "[":
                    line += "| ";
                    break;
                case "⟨":
                    line += "; ";
                    break;
                default:
                    failWithContext("Unexpected broken pipe.");
            }
        } else if ("-" === token) {
            line += "P.negate ";
        } else if ("_" === token) {
            line += "_ ";
        } else if (specialFn.test(token)) {
            const callName = specialFnMappings[token];
            line += callName + " ";
            calls.add(callName);
        } else if (infixFn.test(token)) {
            const callName =
                token in infixFnMappings ?
                    infixFnMappings[token] :
                    token;
            line += callName + " ";
            calls.add(callName);
        } else if (upperId.test(token)) {
            const callName = upperIdMappings[token];

            if (!callName) {
                failWithContext("No such built-in defined: " + token);
            }

            line += callName + (backtickFlag ? "` " : " ");
            backtickFlag = false;
            calls.add(callName);
        } else if (lowerId.test(token)) {
            line += token + " ";
        }
    });

    const leftOver = matchStack.pop();
    if (leftOver) {
        if (leftOver === "(") {
            failWithContext("Mismatched parentheses.", false);
        }
        if (leftOver === "{") {
            failWithContext("Mismatched let blocks.", false);
        }
        if (leftOver === "[") {
            failWithContext("Mismatched square brackets.", false);
        }
        if (leftOver === "⟨") {
            failWithContext("Mismatched case blocks.", false);
        }
    }

    if (awaitCaseOf) {
        failWithContext("Incorrect case block syntax.", false);
    }

    if (multiwayIfScope) {
        failWithContext(
            'Incomplete multi-way "if" statement. (missing |→)',
            false
        );
    }

    if (backtickFlag) {
        line += "`";
    }

    while (~line.indexOf("-> ; ")) {
        const lastIndex = line.lastIndexOf("-> ; ");
        const miniMs = [];
        let repl = null;
        const a = line.slice(lastIndex + 3).split("");
        for (let i = 0; i < a.length; ++i) {
            const ch = a[i];
            if (ch === "⟨") {
                miniMs.push("⟨");
            } else if (ch === "⟩") {
                miniMs.pop();
            } else if (
                ch === ">" &&
                i > 0 &&
                a.length > i + 1 &&
                a[i + 1] === " " &&
                a[i - 1] === "-" &&
                miniMs.length < 1
            ) {
                repl = a.slice(i - 1, a.indexOf(";", i)) + "; ";
            }
        }
        if (repl === null) {
            failWithContext(
                "Misplaced comma in pattern of case statement.",
                false
            );
        }
        const splitOut = line.split("-> ; ");
        const rightSplit = splitOut.pop();
        const leftSplit = splitOut.join("-> ; ");
        line = leftSplit + repl + rightSplit;
    }

    let rangeIndex = 0;
    for (;;) {
        const rangeMatch = range.exec(line.slice(rangeIndex));
        if (!rangeMatch) {
            break;
        }
        rangeIndex += rangeMatch.index + 1;

        const repl =
            "( enumFromThrough " +
                rangeMatch[1].trim() +
                " " +
                rangeMatch[2].trim() +
                " )";
        line = line.replace(rangeMatch[0], repl);
        calls.add("enumFromThrough");
    }

    if (naked) {
        const newId = makeId(nakeds.length);
        nakeds.push([newId, line]);
        line = newId + " a b c d e = " + line;
    }

    lineArray.push(line);
});

const imported = new Set();
calls.forEach(call => {
    const qual = call.split(".").shift();
    if (!qual || imported.has(qual)) {
        return;
    }
    const importStatement = imports[qual];
    if (importStatement) {
        imported.add(qual);
        out += importStatement + "\n";
    }
    const def = definitions[call];
    if (!def) {
        return;
    }
    for (let i = 1; i < def.length; ++i) {
        const addedImportStatement = imports[def[i]];
        if (addedImportStatement) {
            imported.add(def[i]);
            out += addedImportStatement + "\n";
        }
    }
});

out += "\n\n";

const defined = new Set();
calls.forEach(call => {
    if (defined.has(call)) {
        return;
    }
    const def = definitions[call];
    if (!def) {
        return;
    }
    defined.add(call);
    out += def[0];
    out += "\n\n";
});

out += "\n";
out += lineArray.map(l => l.trimRight()).join("\n\n");

const ioCalls =
    [ /(^|[^A-Z])GC($|[^A-Z])/
    , /(^|[^A-Z])GL($|[^A-Z])/
    , /(^|[^A-Z])IR($|[^A-Z])/
    , /(^|[^A-Z])P($|[^A-Z])/
    , /(^|[^A-Z])PS($|[^A-Z])/
    , /(^|[^A-Z])PT($|[^A-Z])/
    , /(^|[^A-Z])RF($|[^A-Z])/
    , /(^|[^A-Z])WF($|[^A-Z])/
    ];

out += "\n\n\n";
out += "main :: P.IO ()\n";
out += "main = do\n";
out += "    a <- E.getArgs\n";
out += '    let b = if P.length a P.> 0 then a P.!! 0 else ""\n';
out += '    let c = if P.length a P.> 1 then a P.!! 1 else ""\n';
out += '    let d = if P.length a P.> 2 then a P.!! 2 else ""\n';
out += '    let e = if P.length a P.> 3 then a P.!! 3 else ""\n';
nakeds.forEach(n => {
    let isIo = false;
    for (let i = 0; i < ioCalls.length; ++i) {
        if (ioCalls[i].test(n[1])) {
            isIo = true;
            break;
        }
    }
    if (isIo) {
        out += "    " + n[0] + " a b c d e\n";
    } else {
        out += "    P.print P.$ " + n[0] + " a b c d e\n";
    }
});

try {
    fs.writeFileSync(outputFile, out, "utf8");
} catch (e) {
    throw e; // lol
}

console.log("Successfully wrote", outputFile);
