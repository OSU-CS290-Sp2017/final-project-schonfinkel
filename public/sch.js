window.schtohs = (function() {
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
    ":":  ":",
    "<":  "P.<",
    ">":  "P.>",
    "^":  "P.^",
    "*>": "App.*>",
    "**": "P.**",
    "++": "P.++",
    "<=": "P.<=",
    "<$": "App.<$",
    "<*": "App.<*",
    "^^": "P.^^",
    "&&": "P.&&",
    "||": "P.||"
};

const upperIdMappings = {
    "A":  "L.filter",
    "AB": "P.abs",
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

    "&%&%&": [`\
infixl 0 &%&%&
(&%&%&) :: P.Bool -> P.Bool -> P.Bool
(&%&%&) x y = x P.&& y`],

    "!>^<!": [`\
infixl 7 !>^<!
(!>^<!) :: [a] -> [b] -> [(a, b)]
(!>^<!) xs ys = [(x, y) | x <- xs, y <- ys]`],

    "^-^-^": [`\
infixl 6 ^-^-^
(^-^-^) :: P.Num a => a -> a -> a
(^-^-^) x y = x P.- y`],

    "+:+:+": [`\
infixl 5 +:+:+
(+:+:+) :: [a] -> a -> [a]
(+:+:+) l a = l P.++ [a]`],

    "subIndex": [`\
subIndex :: P.Integral i => i -> a -> [a] -> [a]
subIndex i a (b:bs)
    | i P.< 0     = subIndex (L.genericLength bs P.+ i P.+ 1) a (b : bs)
    | i P.== 0    = a : bs
    | P.otherwise = b : subIndex (i P.- 1) a bs`, "L"],

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
enumFromThrough :: P.Enum a => a -> a -> [a]
enumFromThrough x y
    | P.fromEnum x P.<= P.fromEnum y = [x..y]
    | P.otherwise                    = [x,(P.pred x)..y]`]
};

/* Ordered by precedence */
const lineFeed = /^\n+/;
const charLiteral = /^'\\?[^\n]'/;
const strLiteral = /^"(\\.|[^"])*"/;
const blockComment = /^{-[\s\S]*?-}/;
const lineComment = /^--[^\n]*/;
const spacing = /^ +/;
const rightArr = /^→/;
const leftArr = /^←/;
const do_ = /^⟥/;
const lambda = /^\\(?=[^!#\$%&*+./:<=>?@\\^|~-])/;
const doubleDots = /^\.\.(?=[^!#\$%&*+./:<=>?@\\^|~-]|$)/;
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
const infixFn = /^(≫=|\^≫|≫|≫>|≫\^|\^≪|≪<|≪\^|=≪|⌊|⌊\^|⌊#|⌊!|[!#\$%&*+./:<=>?@\\^|~\-]+)/;
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
    , lambda
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

function compile(code) {
    /* Tokenization */

    const tokens = [[]];

    while (code.length > 0) {
        let matched = false;

        for (let i = 0; i < regexes.length; ++i) {
            const regex = regexes[i];
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
            let err = "Encountered unexpected character: " + code[0] + "\n";
            err += "Context:\n\n";
            err += "    " + tokens[tokens.length - 1].join(" ") + "\n";
            throw err;
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
    const range = /\[(.*?\S+?\s+?)\.\.(\s+?\S+?.*?)\]/;
    function makeId(i) {
        return (i >= 26 ? makeId((i / 26 >> 0) - 1) : "") +
            "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0] +
            "9";
    }
    function trimRange(rangeMatch) {
        if (!rangeMatch) {
            return null;
        }

        const leftHalf = rangeMatch[1].split("");
        const bracketStack1 = [0];
        leftHalf.forEach((chr, i) => {
            switch (chr) {
                case "[":
                    bracketStack1.push(i + 1);
                    break;
                case "]":
                    bracketStack1.pop();
            }
        });
        const leftIndex = bracketStack1.pop();
        if (leftIndex === undefined) {
            failWithContext("The range regexp is wrong!", false);
        }

        const bracketStack2 = ["["];
        const rightHalf = rangeMatch[2].split("");
        let rightHalfAccu = "";
        let closed = false;
        for (let _ = 0; _ < rightHalf.length; ++_) {
            const chr = rightHalf[_];
            switch (chr) {
                case "[":
                    bracketStack2.push("[");
                    break;
                case "]":
                    bracketStack2.pop();
                    if (!bracketStack2.length) {
                        closed = true;
                    }
            }
            if (closed) {
                break;
            }
            rightHalfAccu += chr;
        }

        return {
            0: "[" + rangeMatch[1].slice(leftIndex) + ".." + rightHalfAccu + "]",
            1: rangeMatch[1].slice(leftIndex),
            2: rightHalfAccu,
            index: leftIndex
        };
    }
    const openComment = /({-|--[^\n]*)/;

    tokens.forEach(l => {
        const l_ = [];

        function failWithContext(msg, pinpoint) {
            if (pinpoint === undefined) {
                pinpoint = true;
            }

            let err = "";
            if (msg) {
                err += msg + "\n";
            } else {
                err += "Parsing failure.\n";
            }

            err += "Context:\n\n";

            const context = l_.join(" ");
            if (pinpoint) {
                const trimmed =
                    context.length <= 79 ?
                        context :
                        context.slice(context.length - 79);
                err += " ".repeat(trimmed.length - 1) + "\u2193\n";
                err += trimmed + "\n";
            } else {
                err += context + "\n";
            }

            throw err;
        }

        let line = "";
        let naked = true;

        let backtickFlag = false;
        let doStack = [];
        const matchStack = [];
        let awaitCaseOf = 0;
        let multiwayIfScope = 0;

        l.forEach(token => {
            l_.push(token);

            if (
                backtickFlag &&
                !(
                    upperId.test(token) ||
                    lowerId.test(token) ||
                    infixFn.test(token) ||
                    specialFn.test(token)
                )
            ) {
                failWithContext("Illegal use of backtick: `" + token);
            }

            if (multiwayIfScope <= matchStack.length) {
                multiwayIfScope = 0;
            }

            while (
                doStack.length &&
                doStack[doStack.length - 1] > matchStack.length
            ) {
                doStack.pop();
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
                line += "do ";
                doStack.push(matchStack.length);
            } else if ("\\" === token) {
                line += "\\ ";
            } else if (".." === token) {
                line += ".. ";
            } else if ("=" === token) {
                line += "= ";
                if (!matchStack.length) {
                    naked = false;
                }
            } else if (";" === token) {
                if (
                    doStack.length &&
                    doStack[doStack.length - 1] === matchStack.length
                ) {
                    line += "; ";
                } else {
                    line += " ";
                }
                // TODO: rest of the semicolon semantics? (?)
            } else if ("`" === token) {
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
                line +=
                    backtickFlag ?
                        "( P.flip " + callName + " ) " :
                        callName + " ";
                backtickFlag = false;
                calls.add(callName);
            } else if (infixFn.test(token)) {
                const callName =
                    token in infixFnMappings ?
                        infixFnMappings[token] :
                        token;
                line +=
                    backtickFlag ?
                        "( P.flip " + callName + " ) " :
                        callName + " ";
                backtickFlag = false;
                calls.add(callName);
            } else if (upperId.test(token)) {
                const callName = upperIdMappings[token];

                if (!callName) {
                    failWithContext("No such built-in defined: " + token);
                }

                line +=
                    (backtickFlag ? "`" : "") +
                        callName +
                        (backtickFlag ? "` " : " ");
                backtickFlag = false;
                calls.add(callName);
            } else if (lowerId.test(token)) {
                line +=
                    (backtickFlag ? "`" : "") +
                        token +
                        (backtickFlag ? "` " : " ");
                backtickFlag = false;
            }
        });

        if (matchStack.length > 0) {
            const splitted = line.split(openComment);
            const split = (() => {
                if (splitted.length === 1) {
                    return [splitted[0], ""];
                }
                if (splitted[splitted.length - 1] === "") {
                    return [
                        splitted.slice(0, splitted.length - 2).join(""),
                        splitted[splitted.length - 2]
                    ];
                }
                if (~splitted[splitted.length - 1].indexOf("-}")) {
                    return [splitted.join(""), ""];
                }
                return [
                    splitted.slice(0, splitted.length - 3).join(""),
                    splitted[splitted.length - 3] + splitted[splitted.length - 2]
                ];
            })();
            let leftOver = matchStack.pop();
            while (leftOver) {
                switch (leftOver) {
                    case "(":
                        split[0] += ") ";
                        break;
                    case "[":
                        split[0] += "] ";
                        break;
                    default:
                        split[0] += ") ";
                        if (awaitCaseOf > matchStack.filter(m => m === "⟨").length) {
                            failWithContext("Incorrect case block syntax.");
                        }
                }
                leftOver = matchStack.pop();
            }
            line = split.join("");
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
            failWithContext("Unexpected backtick.");
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
            const rangeMatch = trimRange(range.exec(line.slice(rangeIndex)));
            if (!rangeMatch) {
                break;
            }
            rangeIndex += rangeMatch.index + 1;

            const rangePart1 = rangeMatch[1].trim();
            const matchStack = [];
            let multiwayIfScope = 0;
            let rangePartCons = rangePart1.slice(0);
            const tokens = [];
            let isFromThrough = true;
            while (rangePartCons.length > 0 && isFromThrough) {
                let matched = false;

                for (let i = 0; i < regexes.length; ++i) {
                    const regex = regexes[i];
                    const match = regex.exec(rangePartCons);
                    if (match === null) {
                        continue;
                    }

                    const matchStr = match[0];
                    rangePartCons = rangePartCons.slice(matchStr.length);

                    if (~matchStr.indexOf("\n")) {
                        failWithContext("wat (LF): " + rangePart1, false);
                    } else if (!spacing.test(matchStr)) {
                        if (rightArr.test(matchStr)) {
                            if (
                                multiwayIfScope > matchStack.length &&
                                tokens[tokens.length - 1] === "|"
                            ) {
                                multiwayIfScope = 0;
                            }
                        } else if (~["(", "{", "[", "⟨"].indexOf(matchStr)) {
                            matchStack.push(matchStr);
                        } else if (~[")", "}", "]", "⟩"].indexOf(matchStr)) {
                            matchStack.pop();
                        } else if (comma.test(matchStr)) {
                            if (!multiwayIfScope && !matchStack.length) {
                                isFromThrough = false;
                                matched = true;
                                break;
                            }
                        } else if ("|" === matchStr) {
                            if (!multiwayIfScope) {
                                multiwayIfScope = matchStack.length + 1;
                            }
                        }
                        tokens.push(matchStr);
                    }

                    matched = true;
                    break;
                }

                if (!matched) {
                    failWithContext(
                        "Magically managed to fail tokenization after the " +
                            "first pass while parsing the first part of " +
                            "a range:\n" +
                            rangePartCons,
                        false
                    );
                }
            }

            if (isFromThrough) {
                const repl =
                    "( enumFromThrough ( " +
                        rangePart1 +
                        " ) ( " +
                        rangeMatch[2].trim() +
                        " ) )";
                line = line.replace(rangeMatch[0], repl);
                calls.add("enumFromThrough");
            }
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
        if (call[0] === '`') {
            call = call.slice(1);
        }
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

    return out;
}

return { compile };

})();
