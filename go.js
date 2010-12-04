var http = require('http'),
    fs = require('fs'),
    sys = require('sys'),
    url = require('url');

var PORT = 8000;
var STATIC_FILES_DIR = './static-files'
var INDEX_FILE = '/index.html';

var COMPILED_FILE = '/webxray.js';
var COMPILED_FILENAME = STATIC_FILES_DIR + COMPILED_FILE;

var COMPILED_FILE_PARTS = [
  'src/intro.js'
, 'jquery/src/core.js'
, 'jquery/src/support.js'
, 'jquery/src/data.js'
, 'jquery/src/queue.js'
, 'jquery/src/attributes.js'
, 'jquery/src/event.js'
, 'jquery/src/selector.js'
, 'jquery/src/traversing.js'
, 'jquery/src/manipulation.js'
, 'jquery/src/css.js'
, 'jquery/src/ajax.js'
, 'jquery/src/effects.js'
, 'jquery/src/offset.js'
, 'jquery/src/dimensions.js'
, 'src/utils.js'
, 'src/event-emitter.js'
, 'src/focused-overlay.js'
, 'src/hud-overlay.js'
, 'src/main.js'
, 'src/outro.js'
];

var STATIC_FILES = {
  '/index.html': 'text/html'
, '/webxray.css': 'text/css'
, '/bookmarklet.js': 'application/javascript'
};

function buildCompiledFileSync() {
  var code = '';
  COMPILED_FILE_PARTS.forEach(function(filename) {
    code += fs.readFileSync(filename, 'utf-8');
  });
  return code;
}

function runServer() {
  var server = http.createServer(function(req, res) {
    var info = url.parse(req.url);
    var path = info.pathname == '/' ? INDEX_FILE : info.pathname;

    console.log("path", path);

    if (path in STATIC_FILES) {
      res.writeHead(200, {'Content-Type': STATIC_FILES[path]});
      var file = fs.createReadStream(STATIC_FILES_DIR + path);
      sys.pump(file, res);
    } else if (path == COMPILED_FILE) {
      res.writeHead(200, 'OK', {'Content-Type': 'application/javascript'});
      res.end(buildCompiledFileSync());
    } else {
      res.writeHead(404, 'Not Found', {'Content-Type': 'text/plain'});
      res.end('Not Found: ' + path);
    }
  });

  console.log('Serving on port ' + PORT);

  server.listen(PORT);
}

function showHelp() {
  lines = [
    "usage: go.js <command>",
    "",
    "commands:",
    "",
    "  serve - run web server on port " + PORT,
    "  compile - generate " + COMPILED_FILENAME,
    ""
  ];

  sys.puts(lines.join('\n'));
}

function main(argv) {
  if (argv.length == 2) {
    showHelp();
    process.exit(1);
  } else {
    var cmd = argv[2];
    switch(cmd) {
      case 'serve':
        runServer();
        break;
      case 'compile':
        fs.writeFileSync(COMPILED_FILENAME, buildCompiledFileSync());
        sys.puts('wrote ' + COMPILED_FILENAME + '.');
        break;
      default:
        sys.puts('unknown command: ' + cmd);
        showHelp();
        process.exit(1);
    }
  }
}

if (require.main == module)
  main(process.argv);