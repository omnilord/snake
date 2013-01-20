var speed = 1;
var heartbeat = undefined;

var world = {
  "grid": undefined,
  "height": 20,
  "width": 20,
  "create": function(w, h) {
    if (!isNaN(w) && !isNaN(h)) {
      if (w >= 10) this.width = w;
      if (h >= 10) this.height = h;
    }
    this.grid = $("<table></table>");
    for (var hi = 0; hi < this.height; hi++) {
      var $row = $("<tr></tr>");
      for (var wi = 0; wi < this.width; wi++) {
        $row.append($("<td></td>"));
      }
      this.grid.append($row);
    }
    $("#main").empty().append(this.grid);
  },
  "cell": function(x, y) {
    if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1) {
      return undefined;
    }
    return this.grid.find("tr").eq(y).find("td").eq(x);
  },
  "removeApple": function(x, y) {
    this.cell(x, y).removeClass("apple");
    if (this.grid.find("td.apple").length == 0) {
      speed = speed + 1;
      this.generateApples();
    }
  },
  "generateApples": function() {
    var a = $("#apples").val() * speed;
    var x = $("#x_width").val();
    var y = $("#y_width").val();
    while (a-- > 0) {
      var xr = Math.floor(Math.random() * x);
      var yr = Math.floor(Math.random() * y);
      var $test = this.cell(xr, yr);
      while ($test.hasClass("apple") || $test.hasClass("worm")) {
        xr = Math.floor(Math.random() * x);
        yr = Math.floor(Math.random() * y);
        $test = this.cell(xr, yr);
      }
      $test.addClass("apple");
    }
  }
};

var worm = {
  "alive": true,
  "segments": [],
  "length": 3,
  "direction": [0, 0],
  "birth": function() {
    this.length = 3;
    this.segments = [];
    this.alive = true;
    var wx = Math.floor(world.width / 2);
    var wy = Math.floor(world.height / 2);
    this.eat([[wx - 1, wy],[wx, wy],[wx + 1, wy],[wx + 2, wy]], true);
  },
  "changeDirection": function(coords) {
    if (isNaN(coords[0]) || isNaN(coords[1])) {
      return;
    }

    // either we are already heading the same direction, or we need to stop the worm from eating itself
    if (Math.abs(coords[0]) == Math.abs(this.direction[0]) && Math.abs(coords[1]) == Math.abs(this.direction[1])) {
      return;
    }

    // convoluted data validation method to ensure we are only moving 1 block at a time
    for (var c = 0; c < coords.length; c++) {
      if (coords[c] > 0) {
        this.direction[c] = 1;
      } else if (coords[c] < 0) {
        this.direction[c] = -1;
      } else {
        this.direction[c] = 0;
      }
    }
  },
  "move": function() {
    var head = this.segments[0];
    var vector = this.direction;
    this.eat([[head[0] + vector[0], head[1] + vector[1]]]);
  },
  "eat": function(coords, birthing) {
    for (var a = 0; a < coords.length; a++) {
      var c = coords[a];
      var next = world.cell(c[0], c[1]);
      if (!birthing) {
        if (typeof next == "undefined") {
          return this.die("Ran into wall");
        }
        if (next.hasClass("worm")) {
          return this.die("You ate yourself in half!");
        }
      }
      if ($(next.addClass("worm")[0]).hasClass("apple")) {
        world.removeApple(c[0], c[1]);
        this.length = this.length + 1;
      }
      this.segments.unshift(c);
      this.poop();
    }
  },
  "poop": function() {
    if (this.segments.length > this.length) {
      var rem = this.segments.pop();
      world.cell(rem[0], rem[1]).removeClass("worm");
    }
  },
  "die": function(msg) {
    this.alive = false;
    if (confirm("OH NO!  YOU DIED!\n"+msg+"\n\nPlay again?")) {
      $("#create").trigger("click");
    }
  }
};

var yesCaptain = function() {
  worm.move();
  if (worm.alive) {
    heartbeat = setTimeout(yesCaptain, (1000 / speed));
  } else {
    clearTimeout(heartbeat);
    heartbeat = undefined;
  }
}

jQuery(function($) {
  $("#create").on("click", function(ev) {
    var x = $("#x_width").val();
    var y = $("#y_width").val();
    world.create(x, y);
    worm.birth();
    world.generateApples(5);
  }).trigger("click");

  $("#start").on("click", function(ev) {
    speed = $("#speed").val();
    heartbeat = setTimeout(yesCaptain, (1000 / speed));
  });

  $(document).on("keydown", function(ev) {
    var vector = [0, 0];
    switch (ev.which) {
      case 37: vector = [-1, 0]; break;
      case 38: vector = [0, -1]; break;
      case 39: vector = [1, 0]; break;
      case 40: vector = [0, 1]; break;
      default: return;
    }
    worm.changeDirection(vector);
    if (heartbeat == undefined) $("#start").trigger("click");
  });
});
