"use strict";

/******** Imports ********/
const babel         = require("babel-core");
const codeHighlight = require("./codeHighlight");
const exphbs        = require("express-handlebars");
const express       = require("express");
const fs            = require("fs");
const markdown      = require("markdown").markdown;
const path          = require("path");


/******** Setup ********/
const app = express();
const port = +process.env.PORT ? +process.env.PORT : 3000;
const babelCache = {};

/******** Pre-processing for converting Markdown to docs ********/
const htmlEntities =
    [ [/&lt;/g,    "<"]
    , [/&gt;/g,    ">"]
    , [/&amp;/g,   "&"]
    , [/&quot;/g,  '"']
    , [/&apos;/g,  "'"]
    , [/&cent;/g,  "¢"]
    , [/&pound;/g, "£"]
    , [/&#60;/g,   "<"]
    , [/&#62;/g,   ">"]
    , [/&#38;/g,   "&"]
    , [/&#34;/g,   '"']
    , [/&#39;/g,   "'"]
    , [/&#162;/g,  "¢"]
    , [/&#163;/g,  "£"]
    ];
function unescapeHtmlEntities(str) {
    return htmlEntities.reduce(
        (accu, ent) => accu.replace(ent[0], ent[1]),
        str
    );
}

const tripleTickRe = /```[a-z]+/g;
const codeBlockRe = /```[\s\S]+?```/g;
const linkRe = /<a href="(.+?)">(.+?)<\/a>/g;
const startPreRe = /\?pre/g;
const endPreRe = /!pre/g;
const brokenMdParserFix = /<p>\?pre<code><\/code>`([\s\S]+?)<code><\/code>`!pre<\/p>/g;
const codeRe = /<code>([\s\S]+?)<\/code>/g;
const allLineStarts = /^/gm;
const readmeContent =
    fs.readFileSync("./public/README.md", "utf8")
      .replace(tripleTickRe, "```")
      .replace(codeBlockRe, "?pre$&!pre");

function highlightCodeBlock(match, p1) {
    try {
        const highlighted =
            "<code>" +
            codeHighlight.parse(unescapeHtmlEntities(p1)) +
            "</code>";
        return highlighted.replace(allLineStarts, "    ");
    } catch (e) {
        return match.replace(allLineStarts, "    ");
    }
}

const pTagRe = /<\/?p>/g;
function brokenMdParserRepl(match, p1) {
    return "<p>?pre<code>" + p1.replace(pTagRe, "") + "</code>!pre</p>";
}

let readmeHtml =
    markdown
        .toHTML(readmeContent)
        .replace(brokenMdParserFix, brokenMdParserRepl)
        .replace(codeRe, highlightCodeBlock)
        .replace(linkRe, '<a href="$1" target="_blank">$2</a>')
        .replace(startPreRe, '<pre class="snippet-pre">')
        .replace(endPreRe, "</pre>")
        .replace("<h1>Schönfinkel</h1>", "");

const codepageHtml =
    fs.readFileSync(
        path.join(
            __dirname,
            "views",
            "partials",
            "codepage.handlebars"
        ),
        "utf8"
    )
    .replace(codeRe, highlightCodeBlock);
const bootstrapRepls =
    [ [/!!!info!!!([\s\S]+?)!!!\/info!!!/g, '<div class="alert alert-info" role="alert">$1</div>']
    , [/!!!hide!!!([\s\S]+?)!!!\/hide!!!/g, "$1"]
    , [/!!!button!!!\s*(<a href="[\s\S]+?")>([\s\S]+?)<\/a>\s*!!!\/button!!!/g, '$1 class="btn btn-info btn-block" role="button">$2</a>']
    , [/!!!warn!!!([\s\S]+?)!!!\/warn!!!/g, '<div class="alert alert-warning" role="alert">$1</div>']
    , [/!!!codepage!!!/g, codepageHtml.replace(/\$/g, "$$$$")]
    ];

readmeHtml = bootstrapRepls.reduce(
    (accu, repl) => accu.replace(repl[0], repl[1]),
    readmeHtml
);

const codeTagRe = /<\/?code.*?>/g;
const spanTagRe = /<\/?span.*?>/g;

const docContents = (() => {
    const dc = [];
    const headerRe = /<h1>([^\n]+?)<\/h1>/;

    let lastHeader = "<h1>Schönfinkel Documentation</h1>";
    while (readmeHtml.length > 0) {
        const lastHeaderName = headerRe.exec(lastHeader)[1];
        const headerMatch = headerRe.exec(readmeHtml);
        if (!headerMatch) {
            dc.push(
                [ lastHeaderName
                , lastHeader + readmeHtml
                ]
            );
            break;
        }
        dc.push(
            [ lastHeaderName
            , lastHeader + readmeHtml.slice(0, headerMatch.index)
            ]
        );
        lastHeader = headerMatch[0];

        readmeHtml =
            readmeHtml.slice(headerMatch.index + headerMatch[0].length);
    }

    return dc;
})();
const docHeaders =
    docContents.map(
        dc => dc[0].replace(codeTagRe, "").replace(spanTagRe, "")
    ).slice(1);


/******** Pre-processing for showing random highlighted  ********/
/******** code snippets on the index page                ********/
const codeSnippetSelection = [
    "f b=[|i>j→-2|i<j→1|→0¦(i,j)←b\n-- :: Integral i => [(i, i)] -> [i]",
    "f=(Δ1).L -- get length and subtract 1\ng=f[8..1 -- g=7",
    '("!-",,"-!")↵[0..2\n-- [("!-", 0, "-!"), ("!-", 1, "-!"), ("!-", 2, "-!")]',
    "Σ$(Nn/)↵[1..Nn\n-- Sum harmonic series for\n-- n = `command-line argument` :: String",
    "r=[0..9\n['|':(r≫=\\i→[|(iΔb,jΔc)∈[1,2,0,1,2]⊠[0,1,2,2,2]→'*'|→'_','|'])¦j←r\n-- Emit a 'Game of Life' glider on a 10x10 grid",
    "n=[0..7\nPS⤔[[H$((i,j)∈)⊙V(\\s_→A(\\(z,w)->z∈n&&w∈n)$(\\(a,b)→F(\\c d→(a+c,b+d))[1,1,-1,-1,-2,-2,2,2][2,-2,2,-2,1,-1,1,-1])=≪s)[(Nb,Nc)]n¡0+48¦j←n]¦i←n\n-- Full program printing map of number of moves required\n-- by a knight to arrive at all places on the chessboard\n-- starting from the coordinates supplied as arguments"
];

function fisherYates(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; --i) {
        const j = Math.floor((i + 1) * Math.random());
        const old = a[i];
        a[i] = a[j];
        a[j] = old;
    }
    return a;
}

function getRandomCodeSnippets(count) {
    return fisherYates(codeSnippetSelection)
          .slice(0, count)
          .map(codeHighlight.parse);
}

/******** Setup for button pad on editor page ********/
const exoticChars = "⊛→←≡≢¬⊙⩖⤔∈⁂⅋≫≪∩∪Σ↵⊢¦∀∃⟨⟩¡⟥Δ⌊×⊠÷⋄".split("");
const exoticCharRows = exoticChars.reduce(
    (accu, chr) => {
        const row = accu[0];
        const index = accu[1];
        if (index % 3 === 0) {
            row.push([]);
        }
        row[row.length - 1].push(chr);
        return [row, index + 1];
    },
    [[], 0]
)[0];


/******** Request handling with middleware ********/
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.get("/docs", (req, res) => {
    const active = 0;

    res.render("docs", {
        miniTopRow: true,
        miniTopRowOffset: 3,
        docHeaders: docHeaders.map((h, i) => {
            return {
                title: h,
                active: false,
                docIndex: i + 1
            };
        }),
        docContent: docContents[active][1],
        prev: {
            title: "Schönfinkel Documentation",
            docIndex: 0
        },
        next: {
            title: docHeaders[active],
            docIndex: 1
        }
    });
});

app.get("/docs/*", (req, res) => {
    const active = +req.url.split("/").filter(s => s).pop();
    if (isNaN(active) || active < 0 || active >= docContents.length) {
        res.status(404).render("404Page");
        return;
    }

    res.render("docs", {
        miniTopRow: true,
        miniTopRowOffset: 3,
        docHeaders: docHeaders.map((h, i) => {
            return {
                title: h,
                active: i + 1 === active,
                docIndex: i + 1
            };
        }),
        docContent: docContents[active][1],
        prev: {
            title: active > 1 ?
                docHeaders[active - 2] :
                "Schönfinkel Documentation",
            docIndex: Math.max(active - 1, 0)
        },
        next: {
            title: docHeaders.length > active ?
                docHeaders[active] :
                "",
            docIndex: active + 1
        }
    });
});

app.get("/editor", (req, res) => {
    res.render("editor", {
        miniTopRow: true,
        miniTopRowOffset: 1,
        exoticCharRows
    });
});

app.get("/sch", (req, res) => {
    const filePath = path.join(__dirname, "public", "sch");

    res.set("Content-disposition", "attachment; filename=sch");
    res.set("Content-type", "text/javascript");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

app.get("/download", (req, res) => {
    res.render("download", {
        miniTopRow: true,
        miniTopRowOffset: 1
    });
});

app.get("/", (req, res) => {
    const rcs = getRandomCodeSnippets(3);

    res.render("indexPage", {
        codeSnippets: rcs,
        miniTopRow: false
    });
});

app.get(/\/[0-9a-zA-Z_\-]+\.js\/?/, (req, res) => {
    const filename = req.url.split("/").filter(s => s).pop();
    if (filename in babelCache) {
        res.send(babelCache[filename]);
        return;
    }

    const filepath = path.join(__dirname, "public", filename);
    babel.transformFile(filepath, {}, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500);
            return;
        }
        const code = result.code.replace('"use strict";', "");
        babelCache[filename] = code;
        res.send(code);
    });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
    res.status(404).render("404Page");
});

/******** Finally, start listening ********/
app.listen(port, () => {
    console.log("== Server listening on port", port);
});
