"use strict";

/******** Imports ********/
const babel                   = require("babel-core");
const bodyParser              = require("body-parser");
const codeHighlight           = require("./codeHighlight");
const exphbs                  = require("express-handlebars");
const express                 = require("express");
const fs                      = require("fs");
const markdown                = require("markdown").markdown;
const {MongoClient, ObjectId} = require("mongodb");
const path                    = require("path");


/******** Setup ********/
const app = express();
const hbs = exphbs.create({
    helpers: {
        multThree: i => i > 2 && i % 3 === 0,
        highlight: txt => codeHighlight.parse(txt),
        lines: s => s.split(/\r?\n/gm)
    }
});
const port = +process.env.PORT ? +process.env.PORT : 3000;
const babelCache = {};

const mongoHost = process.env.MONGO_HOST;
const mongoPort = +process.env.MONGO_PORT ? +process.env.MONGO_PORT : 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDbName = process.env.MONGO_DB;
const mongoUrl =
    "mongodb://" +
        mongoUser +
        ":" +
        mongoPassword +
        "@" +
        mongoHost +
        ":" +
        mongoPort +
        "/" +
        mongoDbName;
let mongoDb;

console.log("== MongoDB URL:", mongoUrl);

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
    "Σ$(Nb/)↵[1..Nb\n-- Sum harmonic series, where\n-- `b` is the first command-line argument\n-- [of type String]",
    "r=[0..9\n['|':(r≫=\\i→[|(iΔb,jΔc)∈[1,2,0,1,2]⊠[0,1,2,2,2]→'*'|→'_','|'])¦j←r\n-- Emit a 'Game of Life' glider on a 10x10 grid",
    "n=[0..7\nPS⤔[[H$((i,j)∈)⊙V(\\s_→A(\\(z,w)→z∈n&&w∈n)$(\\(a,b)→F(\\c d→(a+c,b+d))[1,1,-1,-1,-2,-2,2,2][2,-2,2,-2,1,-1,1,-1])=≪s)[(Nb,Nc)]n¡0+48¦j←n]¦i←n\n-- Full program printing map of number of moves required\n-- by a knight to arrive at all places on the chessboard\n-- starting from the coordinates supplied as arguments"
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
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(bodyParser.json());

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

app.get("/docs/:docNum", (req, res) => {
    const active = +req.params.docNum;
    if (!(active in docContents)) {
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
        exoticCharRows,
        code: ""
    });
});

app.get("/editor/:snippetId", (req, res) => {
    const snippetId = req.params.snippetId;
    const collection = mongoDb.collection("snippets");

    const _id = (() => {
        try {
            return ObjectId(snippetId);
        } catch (e) {
            return;
        }
    })();

    if (!_id) {
        res.render("editor", {
            miniTopRow: true,
            miniTopRowOffset: 1,
            exoticCharRows,
            code: ""
        });
        return;
    }

    collection
        .find({ _id })
        .next((err, result) => {
            if (err || !result) {
                res.render("editor", {
                    miniTopRow: true,
                    miniTopRowOffset: 1,
                    exoticCharRows,
                    code: ""
                });
                if (err) {
                    console.log(err);
                }
            } else {
                res.render("editor", {
                    miniTopRow: true,
                    miniTopRowOffset: 1,
                    exoticCharRows,
                    code: result.code
                });
            }
        });
});

app.post("/editor/addSnippet", (req, res) => {
    if (
        req.body &&
        req.body.author.trim() &&
        req.body.code &&
        req.body.description.trim() &&
        req.body.title.trim()
    ) {
        if (req.body.author.length > 24) {
            res.status(400).send(
                "Author of snippet must not exceed 24 characters."
            );
            return;
        }
        if (req.body.code.length > 5000) {
            res.status(400).send(
                "Code snippet must not exceed 5000 characters."
            );
            return;
        }
        if (req.body.description.length > 1000) {
            res.status(400).send(
                "Description of snippet must not exceed 1000 characters."
            );
            return;
        }
        if (req.body.title.length > 36) {
            res.status(400).send(
                "Title of snippet must not exceed 36 characters."
            );
            return;
        }

        const collection = mongoDb.collection("snippets");
        const snippet = {
            author: req.body.author.trim(),
            code: req.body.code,
            description: req.body.description.trim(),
            title: req.body.title.trim()
        };

        collection.insertOne(snippet, err => {
            if (err) {
                console.log(
                    "== Error storing code snippet (" +
                        JSON.stringify(snippet) +
                        ") into database:",
                    err
                );
                res.status(500).send(
                    "Error inserting code snippet into database: " +
                        err
                );
            } else {
                res.status(200).send();
            }
        });
    } else {
        res.status(400).send(
            "Code snippet must have some code, a title, a description, and an author."
        );
    }
});

app.get("/sch", (req, res) => {
    const filePath = path.join(__dirname, "public", "sch");

    res.set("Content-Disposition", "attachment; filename=sch");
    res.set("Content-Type", "text/javascript");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

app.get("/download", (req, res) => {
    res.render("download", {
        miniTopRow: true,
        miniTopRowOffset: 1
    });
});

app.get("/snippets", (req, res) => {
    const collection = mongoDb.collection("snippets");

    collection.find({}).toArray((err, snippetData) => {
        if (err) {
            res.status(500).send("Error fetching code snippets from DB.");
        } else {
            res.render("snippets", {
                miniTopRow: true,
                miniTopRowOffset: 1,
                snippetData
            });
        }
    });
});

app.get("/snippets/:snippet", (req, res, next) => {
    const snippet = req.params.snippet;
    const collection = mongoDb.collection("snippets");

    collection.find({ snippetid: snippet }).toArray((err, snippetsData) => {
        if (err) {
            console.log(
                "== Error fetching code snippet (" +
                    snippet +
                    ") from database:",
                err
            );
            res.status(500).send("Error fetching code snippet from DB.");
        } else if (snippetsData.length < 1) {
            next();
        } else {
            const snippetData = snippetsData[0];

            res.render("editor", {
                miniTopRow: true,
                miniTopRowOffset: 1,
                exoticCharRows,
                code: snippetData.code
            });
        }
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
MongoClient.connect(mongoUrl, (err, db) => {
    if (err) {
        throw err;
    }

    mongoDb = db;
    app.listen(port, () => console.log("== Server listening on port", port));
});
