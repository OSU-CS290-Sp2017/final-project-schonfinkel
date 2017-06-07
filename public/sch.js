schtohs = (function() {
    "use strict";

    var codepage = "⊛→←≡≢¬⊙⩖⤔∈\n⁂⅋≫≪∩∪Σ↵⊢¦∀∃⟨⟩¡⟥Δ⌊×⊠÷ !\"#$%&'()*+,-./0123456789:;<=>" + "?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⋄";

    var specialFnMappings = {
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

    var infixFnMappings = {
        "^≫": "Arr.^>>",
        "≫": "M.>>",
        "≫=": "M.>>=",
        "≫>": "Arr.>>>",
        "≫^": "Arr.>>^",
        "^≪": "Arr.^<<",
        "≪<": "Arr.<<<",
        "≪^": "Arr.<<^",
        "=≪": "M.=<<",
        "⌊": "P.floor",
        "⌊^": "P.ceiling",
        "⌊#": "P.round",
        "⌊!": "P.truncate",
        "$": "P.$",
        "%": "`P.mod`",
        "*": "P.*",
        "+": "P.+",
        ".": "P..",
        "/": "P./",
        ":": "P.:",
        "<": "P.<",
        ">": "P.>",
        "^": "P.^",
        "*>": "App.*>",
        "**": "P.**",
        "++": "P.++",
        "<=": "P.<=",
        "<$": "App.<$",
        "<*": "App.<*",
        "^^": "P.^^"
    };

    var upperIdMappings = {
        "A": "L.filter",
        "AR": "Arr.arr",
        "B": "L.sortBy",
        "BR": "L.break",
        "C": "F.concat",
        "CG": "O.comparing",
        "CM": "O.compare",
        "CO": "P.cos",
        "CR": "P.curry",
        "CY": "L.cycle",
        "D": "L.nub",
        "DR": "L.genericDrop",
        "DW": "L.dropWhile",
        "E": "F.maximum",
        "ER": "P.error",
        "EV": "P.even",
        "EX": "P.exp",
        "F": "L.zipWith",
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
        "G": "F.minimum",
        "GC": "P.getChar",
        "GD": "P.gcd",
        "GL": "P.getLine",
        "H": "P.toEnum",
        "I": "F.null",
        "IE": "L.iterate",
        "IJ": "May.isJust",
        "IN": "May.isNothing",
        "IR": "P.interact",
        "J": "L.tail",
        "K": "L.genericTake",
        "L": "L.genericLength",
        "LA": "L.last",
        "LG": "P.log",
        "LI": "P.lines",
        "LM": "P.lcm",
        "LU": "L.lookup",
        "LV": "unsafeLookup",
        "M": "P.show",
        "MI": "mapWithIndices",
        "N": "P.read",
        "NE": "F.notElem",
        "O": "P.fromEnum",
        "OD": "P.odd",
        "P": "P.print",
        "PI": "P.pi",
        "PR": "P.pred",
        "PS": "P.putStrLn",
        "PT": "P.putStr",
        "Q": "subIndex",
        "QT": "P.quot",
        "R": "L.reverse",
        "RC": "L.genericReplicate",
        "RF": "P.readFile",
        "RM": "P.rem",
        "RP": "L.repeat",
        "RT": "M.return",
        "S": "L.sort",
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
        "T": "L.transpose",
        "TA": "P.tan",
        "U": "L.intercalate",
        "UC": "P.uncurry",
        "UD": "P.undefined",
        "UL": "P.unlines",
        "UT": "P.until",
        "UW": "P.unwords",
        "UZ": "L.unzip",
        "V": "L.scanl",
        "W": "L.takeWhile",
        "WF": "P.writeFile",
        "WO": "P.words",
        "X": "F.foldl'",
        "Y": "F.foldr",
        "Z": "L.permutations",
        "ZT": "L.zip3",
        "ZU": "L.unzip3",
        "ZW": "L.zipWith3"
    };

    var definitions = {
        "&!&!&": ["infixl 9 &!&!&\n(&!&!&) :: P.Eq a => [a] -> [a] -> [[a]]\n(&!&!&) l n =\n    P.fst P.$ P.until (\\(_, l') -> P.null l') (\\(accu, rest) ->\n        if L.genericTake needleLen rest P.== n then\n            (accu P.++ [[]], L.genericDrop needleLen rest)\n        else\n            (L.init accu P.++ [P.last accu P.++ [P.head rest]], P.tail rest)) ([[]], l)\n    where needleLen = L.genericLength n", "L"],

        "!>^<!": ["infixl 7 !>^<!\n(!>^<!) :: [a] -> [b] -> [(a, b)]\n(!>^<!) xs ys = [(x, y) | x <- xs, y <- ys]"],

        "+:+:+": ["infixr 5 +:+:+\n(+:+:+) :: [a] -> a -> [a]\n(+:+:+) l a = l P.++ [a]"],

        "subIndex": ["subIndex :: P.Integral i => i -> a -> [a] -> [a]\nsubIndex i a (b:bs)\n    | i P.< 0     = subIndex (L.genericLength bs P.+ i P.+ 1) a (b P.: bs)\n    | i P.== 0    = a P.: bs\n    | P.otherwise = b P.: subIndex (i P.- 1) a bs", "L"],

        "unsafeFind": ["unsafeFind :: (a -> P.Bool) -> [a] -> a\nunsafeFind p l =\n    case L.find p l of\n        P.Just a -> a\n        _        -> P.undefined", "L"],

        "findIndex1": ["findIndex1 :: (a -> P.Bool) -> [a] -> P.Int\nfindIndex1 p l =\n    case L.findIndex p l of\n        P.Just i -> i\n        _        -> -1", "L"],

        "unsafeLookup": ["unsafeLookup :: P.Eq a => a -> [(a, b)] -> b\nunsafeLookup k m =\n    case L.lookup k m of\n        P.Just b -> b\n        _        -> P.undefined", "L"],

        "mapWithIndices": ["mapWithIndices :: P.Integral i => (a -> i -> b) -> [a] -> [b]\nmapWithIndices f xs = P.zipWith f xs [0..]"]
    };

    /* Ordered by precedence */
    var lineFeed = /^\n+/;
    var charLiteral = /^'\\?[^\n]'/;
    var strLiteral = /^"(\\.|[^"])*"/;
    var blockComment = /^{-.*?-}/;
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
    var regexes = [lineFeed, charLiteral, strLiteral, blockComment, lineComment, spacing, rightArr, leftArr, do_, doubleDots, numericLiteral, eqBinding, semicolon, backtick, leftParen, rightParen, leftCurBracket, rightCurBracket, leftSqBracket, rightSqBracket, leftAngBracket, rightAngBracket, comma, asAt, vert, brokenVert, unaryMinus, underscore, specialFn, infixFn, upperId, lowerId];

    var imports = {
        "M": "import qualified Control.Monad       as M",
        "App": "import qualified Control.Applicative as App",
        "Arr": "import qualified Control.Arrow       as Arr",
        "F": "import qualified Data.Foldable       as F",
        "L": "import qualified Data.List           as L",
        "May": "import qualified Data.Maybe          as May",
        "O": "import qualified Data.Ord            as O"
    };

    var range = /\[ ?([0-9]*\.?[0-9]+) ?\.\. ?([0-9]*\.?[0-9]+) ?\]/;

    function makeId(i) {
        return (i >= 26 ? makeId((i / 26 >> 0) - 1) : "") + "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0] + "9";
    }

    function compile(input) {
        var code = input.split("").filter(function (c) {
            return ~codepage.indexOf(c);
        }).join("");

        /* Tokenization */

        var tokens = [[]];

        while (code.length > 0) {
            var matched = false;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = regexes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var regex = _step.value;

                    var match = regex.exec(code);
                    if (match === null) {
                        continue;
                    }

                    var matchStr = match[0];
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
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (!matched) {
                var leadingContext = "";
                for (;;) {
                    if (leadingContext.length > 18) {
                        break;
                    }
                    var popped = tokens.pop();
                    if (popped === undefined) {
                        break;
                    }
                    if (~popped.indexOf(" ")) {
                        leadingContext = popped + leadingContext;
                    } else if (~popped.indexOf("\n")) {
                        break;
                    } else {
                        leadingContext = popped + leadingContext;
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

        if (tokens[tokens.length - 1].length < 1) {
            tokens.pop();
        }

        /* Hacky parsing directly into Haskell */

        var out = "import qualified Prelude             as P\n\n";
        var lineArray = [];
        var calls = new Set();
        var nakeds = [];

        tokens.forEach(function (l) {
            var l_ = [];

            function failWithContext(msg, pinpoint) {
                var err = "";

                if (pinpoint === undefined) {
                    pinpoint = true;
                }

                if (msg) {
                    err += msg + "\n";
                } else {
                    err += "Parsing failure.\n";
                }

                err += "Context:\n\n";

                var context = l_.join(" ");
                if (pinpoint) {
                    var trimmed = context.length <= 79 ? context : context.slice(context.length - 79);
                    err += " ".repeat(trimmed.length - 1) + "\u2193\n";
                    err += trimmed + "\n";
                } else {
                    err += context + "\n";
                }

                throw err;
            }

            var line = "";
            var naked = true;

            var backtickFlag = false;
            var doFlag = false;
            var matchStack = [];
            var awaitCaseOf = 0;
            var multiwayIfScope = 0;

            l.forEach(function (token) {
                l_.push(token);

                if (backtickFlag && !(upperId.test(token) || lowerId.test(token))) {
                    failWithContext("Illegal use of backtick: `" + token);
                }

                if (charLiteral.test(token) || strLiteral.test(token) || numericLiteral.test(token)) {
                    line += token + " ";
                } else if (blockComment.test(token) || spacing.test(token)) {
                    line += " ";
                } else if (rightArr.test(token)) {
                    if (multiwayIfScope > matchStack.length) {
                        if (line.length >= 8 && line.slice(line.length - 8) === "else if ") {
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
                    if (awaitCaseOf > matchStack.filter(function (m) {
                        return m === "⟨";
                    }).length) {
                        failWithContext("Incorrect case block syntax.");
                    }
                } else if (comma.test(token)) {
                    if (multiwayIfScope > matchStack.length) {
                        line += "&%&%& ";
                    } else {
                        var peek = matchStack.length > 0 ? matchStack[matchStack.length - 1] : undefined;

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
                    var _peek = matchStack.length > 0 ? matchStack[matchStack.length - 1] : "";

                    switch (_peek) {
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
                    var callName = specialFnMappings[token];
                    line += callName + " ";
                    calls.add(callName);
                } else if (infixFn.test(token)) {
                    var _callName = token in infixFnMappings ? infixFnMappings[token] : token;
                    line += _callName + " ";
                    calls.add(_callName);
                } else if (upperId.test(token)) {
                    var _callName2 = upperIdMappings[token];

                    if (!_callName2) {
                        failWithContext("No such built-in defined: " + token);
                    }

                    line += _callName2 + (backtickFlag ? "` " : " ");
                    backtickFlag = false;
                    calls.add(_callName2);
                } else if (lowerId.test(token)) {
                    line += token + " ";
                }
            });

            var leftOver = matchStack.pop();
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
                failWithContext('Incomplete multi-way "if" statement. (missing |→)', false);
            }

            if (backtickFlag) {
                line += "`";
            }

            while (~line.indexOf("-> ; ")) {
                var lastIndex = line.lastIndexOf("-> ; ");
                var miniMs = [];
                var repl = null;
                var a = line.slice(lastIndex + 3).split("");
                for (var i = 0; i < a.length; ++i) {
                    var ch = a[i];
                    if (ch === "⟨") {
                        miniMs.push("⟨");
                    } else if (ch === "⟩") {
                        miniMs.pop();
                    } else if (ch === ">" && i > 0 && a.length > i + 1 && a[i + 1] === " " && a[i - 1] === "-" && miniMs.length < 1) {
                        repl = a.slice(i - 1, a.indexOf(";", i)) + "; ";
                    }
                }
                if (repl === null) {
                    failWithContext("Misplaced comma in pattern of case statement.", false);
                }
                var splitOut = line.split("-> ; ");
                var rightSplit = splitOut.pop();
                var leftSplit = splitOut.join("-> ; ");
                line = leftSplit + repl + rightSplit;
            }

            var rangeIndex = 0;
            for (;;) {
                var rangeMatch = range.exec(line.slice(rangeIndex));
                if (!rangeMatch) {
                    break;
                }
                rangeIndex += rangeMatch.index + 1;
                if (+rangeMatch[1] <= +rangeMatch[2]) {
                    continue;
                }
                var _repl = "[ " + rangeMatch[1] + ", " + (+rangeMatch[1] - 1) + " .. " + rangeMatch[2] + " ]";
                line = line.replace(rangeMatch[0], _repl);
            }

            if (naked) {
                var newId = makeId(nakeds.length);
                nakeds.push(newId);
                line = newId + " = " + line;
            }

            lineArray.push(line);
        });

        var imported = new Set();
        calls.forEach(function (call) {
            var qual = call.split(".").shift();
            if (!qual || imported.has(qual)) {
                return;
            }
            var importStatement = imports[qual];
            if (importStatement) {
                imported.add(qual);
                out += importStatement + "\n";
            }
            var def = definitions[call];
            if (!def) {
                return;
            }
            for (var i = 1; i < def.length; ++i) {
                var addedImportStatement = imports[def[i]];
                if (addedImportStatement) {
                    imported.add(def[i]);
                    out += addedImportStatement + "\n";
                }
            }
        });

        out += "\n\n";

        var defined = new Set();
        calls.forEach(function (call) {
            if (defined.has(call)) {
                return;
            }
            var def = definitions[call];
            if (!def) {
                return;
            }
            defined.add(call);
            out += def[0];
            out += "\n\n";
        });

        out += "\n";
        out += lineArray.map(function (l) {
            return l.trimRight();
        }).join("\n\n");

        /* Temporary hack ;) */
        out += "\n\n\n";
        out += "main :: P.IO ()\n";
        out += "main = do\n";
        nakeds.forEach(function (n) {
            return out += "    P.print P.$ " + n + "\n";
        });

        return out;
    }

    return { compile: compile };
})();
