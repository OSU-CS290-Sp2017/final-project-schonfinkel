"use strict";

const codeHighlight = require("./codeHighlight");
const exphbs        = require("express-handlebars");
const express       = require("express");
const fs            = require("fs");
const markdown      = require("markdown").markdown;
const path          = require("path");


const app = express();
const port = +process.env.PORT ? +process.env.PORT : 3000;

const htmlEntities =
    [ [/&lt;/g   , "<"]
    , [/&gt;/g   , ">"]
    , [/&amp;/g  , "&"]
    , [/&quot;/g , '"']
    , [/&apos;/g , "'"]
    , [/&cent;/g , "¢"]
    , [/&pound;/g, "£"]
    , [/&#60;/g  , "<"]
    , [/&#62;/g  , ">"]
    , [/&#38;/g  , "&"]
    , [/&#34;/g  , '"']
    , [/&#39;/g  , "'"]
    , [/&#162;/g , "¢"]
    , [/&#163;/g , "£"]
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

const bootstrapRepls =
    [ [/!!!info!!!([\s\S]+?)!!!\/info!!!/g, '<div class="alert alert-info" role="alert">$1</div>']
    ];

readmeHtml = bootstrapRepls.reduce(
    (accu, repl) => accu.replace(repl[0], repl[1]),
    readmeHtml
);

const docContents = (() => {
    const dc = [];
    const headerRe = /<h[1-6]>([^<]+)<\/h[1-6]>/;

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
const docHeaders = docContents.map(dc => dc[0]).slice(1);


const codeSnippetSelection = [
    "[|i>j→-2|i<j→1|→0¦(i,j)←b]\n-- :: Integral i => [(i, i)] -> [i]",
    "f=(Δi).L  -- get length and subtract 1\ng=f[8..1] -- g=7",
    '("!-",,"-!")↵[0..2]\n-- [("!-", 0, "-!"), ("!-", 1, "-!"), ("!-", 2, "-!")]'
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


app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.get("/docs", (req, res) => {
    const active = 0;

    res.render("docs", {
        miniTopRow: true,
        docHeaders: docHeaders.map((h, i) => {
            return { title: h, active: false, docIndex: i + 1 };
        }),
        docContent: docContents[active][1]
    });
});

app.get("/docs/*", (req, res) => {
    const active = +req.url.split("/").filter(s => s).pop();
    if (active >= docContents.length) {
        res.status(404).render("404Page");
        return;
    }

    res.render("docs", {
        miniTopRow: true,
        docHeaders: docHeaders.map((h, i) => {
            return { title: h, active: i + 1 === active, docIndex: i + 1 };
        }),
        docContent: docContents[active][1]
    });
});

app.get("/", (req, res) => {
    const rcs = getRandomCodeSnippets(3);

    res.render("indexPage", {
        codeSnippets: rcs,
        miniTopRow: false
    });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
    res.status(404).render("404Page");
});

app.listen(port, () => {
    console.log("== Server listening on port", port);
});
