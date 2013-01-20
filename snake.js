jQuery(function($) {
  var heartbeat = undefined;

  var world = {
    "grid": undefined,
    "height": 20,
    "width": 20,
    "level": 1,
    "apples": 5,
    "createGrid": function(w, h) {
      if (!isNaN(w) && !isNaN(h)) {
        if (w >= 10) this.width = w;
        if (h >= 10) this.height = h;
      }
      this.grid = $("<table></table>");
      for (var row = 0; row < this.height; row++) {
        var $row = $("<tr></tr>");
        for (var col = 0; col < this.width; col++) {
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
        if (this.level == 10) {
          worm.die("You completed the 10th Level!  Congradulations!");
        } else {
          this.level = this.level + 1;
          $("#level").val(""+this.level);
          this.generateApples(this.apples);
        }
      }
    },
    "generateApples": function(applesPerLevel) {
      this.apples = applesPerLevel;
      var a = applesPerLevel * this.level;
      while (a-- > 0) {
        var $cell;
        do {
          xr = Math.floor(Math.random() * this.width);
          yr = Math.floor(Math.random() * this.height);
          $cell = this.cell(xr, yr);
        } while ($cell.hasClass("apple") || $cell.hasClass("worm"));
        $cell.addClass("apple");
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
      this.eat([[wx, wy]], true);
    },
    "changeDirection": function(coords) {
      if (isNaN(coords[0]) || isNaN(coords[1])) {
        return;
      }

      // either we are already heading the same direction, or we need to stop the worm from backtracking onto itself
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
      tick();
    },
    "move": function() {
      // establish the coordinates of the next cell to eat and eat it
      var head = this.segments[0];
      var vector = this.direction;
      this.eat([[head[0] + vector[0], head[1] + vector[1]]]);
    },
    "eat": function(coords, birthing) {
      // this function determines if the coords of the next cell are edible
      // then it eats an apple, adding 1 to length and sets the class to worm
      // otherwise we have either a cell that doesn't exist (wall) or the worm
      // already occupies the cell and we need to die.
      for (var a = 0; a < coords.length; a++) {
        var c = coords[a];
        var next = world.cell(c[0], c[1]);
        if (!birthing) {
          if (typeof next == "undefined") {
            return this.die("You ran into the wall!");
          }
          if (next.hasClass("worm")) {
            return this.die("You ate yourself!");
          }
        }
        this.segments.unshift(c);
        if ($(next.addClass("worm")[0]).hasClass("apple")) {
          world.removeApple(c[0], c[1]);
          this.length = this.length + 1;
        }
        this.poop();
      }
    },
    "poop": function() {
      // remove the worm's tail segment from the last cell it occupied
      if (this.segments.length > this.length) {
        var rem = this.segments.pop();
        world.cell(rem[0], rem[1]).removeClass("worm");
      }
    },
    "die": function(msg) {
      // The player did something to end the game.  How do you plead?
      clearTimeout(heartbeat);
      heartbeat = undefined;
      this.alive = false;
      if (confirm("GAME OVER!\n\n"+msg+"\n\nPlay again?")) {
        $("#reset").trigger("click");
      }
    }
  };

  var tick = function() {
    // advance one cell at a time
    worm.move();
    if (worm.alive) {
      clearTimeout(heartbeat);
      heartbeat = setTimeout(tick, (1000 / world.level));
    } else {
      clearTimeout(heartbeat);
      heartbeat = undefined;
    }
  }

  // Control events below

  $("#reset").on("click", function(ev) {
    if (heartbeat != undefined) {
      clearTimeout(heartbeat);
      heartbeat = undefined;
    }
    world.level = 1;
    $("#level").val("1");
    var x = $("#x_width").val();
    var y = $("#y_height").val();
    world.createGrid(x, y);
    worm.birth();
    world.generateApples($("#apples").val());
  }).trigger("click");

  $("#level").on("change", function(ev) {
    world.level = $(this).val();
  });

  $("#size").on("change", function(ev) {
    var v = 5 + ($(this).val() * 15);
    $("#x_width").val(v);
    $("#y_height").val(v);
    $("#reset").trigger("click");
  });

  // Validate numeric inputs
  $('INPUT[type="text"]').on("keyup", function(ev) {
      switch (ev.which) {
        case 8:
        case 12:
        case 13:
        case 37:
        case 39:
          break;
        default:
          this.value = this.value.replace(/[^0-9]/g,'');
      }
    })
    .on("keydown", function(ev) {
      switch (ev.which) {
        case 8:
        case 12:
        case 13:
        case 37:
        case 39:
          break;
        default:
          this.value = this.value.substring(0, 1);
      }
    });

  $(document).on("keydown", function(ev) {
    if (!worm.alive) return;
    var vector = [0, 0];
    switch (ev.which) {
      case 37: vector = [-1, 0]; break;
      case 38: vector = [0, -1]; break;
      case 39: vector = [1, 0]; break;
      case 40: vector = [0, 1]; break;
      default: return;
    }
    worm.changeDirection(vector);
    if (heartbeat == undefined) {
      world.level = $("#level").val();
      heartbeat = setTimeout(tick, (1000 / world.level));
    }
  });
});
