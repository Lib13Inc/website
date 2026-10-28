/* Hero particle canvas. Pauses off-screen and when the tab is hidden; draws one still frame
   when the visitor prefers reduced motion. */
(function () {
  var canvas = document.getElementById('demo-canvas');
  var header = document.getElementById('large-header');
  if (!canvas || !header) return;

  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var width, height, circles = [], running = false, onScreen = true;

  function size() {
    width = window.innerWidth;
    height = window.innerHeight;
    header.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;
  }

  function Circle(spread) {
    this.reset(spread);
  }
  Circle.prototype.reset = function (spread) {
    this.x = Math.random() * width;
    this.y = spread ? Math.random() * height : height + Math.random() * 100;
    this.alpha = 0.1 + Math.random() * 0.3;
    this.scale = 0.1 + Math.random() * 0.3;
    this.velocity = Math.random();
  };
  Circle.prototype.draw = function () {
    if (this.alpha <= 0) this.reset(false);
    this.y -= this.velocity;
    this.alpha -= 0.0005;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.scale * 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255,255,255,' + this.alpha + ')';
    ctx.fill();
  };

  function populate() {
    circles = [];
    var count = Math.min(Math.round(width * 0.25), 200);
    for (var i = 0; i < count; i++) circles.push(new Circle(reduce));
  }

  function paint() {
    ctx.clearRect(0, 0, width, height);
    for (var i = 0; i < circles.length; i++) circles[i].draw();
  }

  function frame() {
    if (!running) return;
    paint();
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce || !onScreen || document.hidden) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  size();
  populate();
  if (reduce) paint();
  else start();

  window.addEventListener('resize', function () {
    size();
    populate();
    if (reduce) paint();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start(); else stop();
    }).observe(header);
  }
})();
