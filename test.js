var Client = require("./golems-client").Client;

var T = 8, t = T, N = 1/*28*/, n = 0, start = 0;

var c = new Client({ hostname: "localhost", port: 6013 });

process.on('glom', function (t) {
  if (!(n % T)) { console.log(n + t + 1, '/', N); }
  c.random(function (golem) {
    if (++n < N) process.emit("glom", t);
    else process.exit();
  });
});

process.on('exit', function () {
    var elapsed = (new Date()) - start;
    console.log("completed", n, "requests in", elapsed, "ms with", t, "'threads'");
});

function fire(threads) {
  console.log("starting", threads, "'threads'", "for", N, "requests");
  start = new Date();
  n = 0;
  for (var i = 0; i < threads; i++) process.emit("glom", i);
}

c.authorize("user@example.com", "example", function (response) {
  console.log("authorized for %d distinct golems", response.limit);
  c.schema(function (schema) {
    console.log("using schema: %j", schema);
    fire(T);
  });
});

