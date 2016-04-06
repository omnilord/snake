jQuery(function ($) {
  var heartbeat,
      reset,
      GRIDSIZE = 21,
      heartrate = 500,
      heartdelta = Math.ceil((heartrate - 15) / (GRIDSIZE * GRIDSIZE)),

      world = {
        "grid": undefined,
        "height": GRIDSIZE,
        "width": GRIDSIZE,

        "createGrid": function () {
          this.grid = $("<table></table>");
          $("#main").empty().append(
            this.grid.append(Array(this.height).fill(null).map(() =>
              $('<tr></tr>').append(Array(this.width).fill(null).map(() =>
                $('<td></td>')
              ))
            ))
          );
        },

        "cell": function (x, y) {
          return (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1)
                 ? undefined
                 : this.grid.find("tr").eq(y).find("td").eq(x);
        },

        "removeApple": function (x, y) {
          heartrate = Math.max(15, heartrate - heartdelta);
          this.cell(x, y).removeClass("apple");
          this.apple();
        },

        "apple": function () {
          var $cell;
          do {
            $cell = this.cell(
              Math.floor(Math.random() * this.width),
              Math.floor(Math.random() * this.height)
            );
          } while ($cell.hasClass("worm"));
          $cell.addClass("apple");
        }
      },

      worm = {
        "segments": [],
        "length": 3,
        "direction": [0, 0],

        "birth": function () {
          this.length = 3;
          this.segments = [];
          var wx = Math.floor(world.width / 2);
          var wy = Math.floor(world.height / 2);
          this.eat([[wx, wy]], true);
        },

        "go": function (coords) {
          if (isNaN(coords[0]) || isNaN(coords[1])) {
            return;
          }

          // either we are already heading the same direction, or we need to stop the worm from backtracking onto itself
          if (Math.abs(coords[0]) === Math.abs(this.direction[0]) && Math.abs(coords[1]) === Math.abs(this.direction[1])) {
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

          if (typeof heartbeat == "undefined") {
            $('#top > span').toggleClass('active');
            world.apple();
            tick();
          }
        },

        "move": function () {
          // establish the coordinates of the next cell to eat and eat it
          var head = this.segments[0];
          var vector = this.direction;
          return this.eat([[head[0] + vector[0], head[1] + vector[1]]]);
        },

        "eat": function (coords, birthing) {
          // this function determines if the coords of the next cell are edible
          // then it eats an apple, adding 1 to length and sets the class to worm
          // otherwise we have either a cell that doesn't exist (wall) or the worm
          // already occupies the cell and we need to die.
          for (var a = 0; a < coords.length; a++) {
            var c = coords[a];
            var next = world.cell(c[0], c[1]);
            if (!birthing && (typeof next == "undefined" || next.hasClass("worm"))) {
              alert('Game over.');
              return false;
            }
            this.segments.unshift(c);
            if ($(next.addClass("worm")[0]).hasClass("apple")) {
              $('#eaten').text(this.segments.length - 3 || '0');
              world.removeApple(c[0], c[1]);
              this.length = this.length + 1;
            }
            this.poop();
          }
          return true;
        },

        "poop": function () {
          // remove the worm's tail segment from the last cell it occupied
          if (this.segments.length > this.length) {
            var rem = this.segments.pop();
            world.cell(rem[0], rem[1]).removeClass("worm");
          }
        },
      },

      tick = function () {
        // advance one cell at a time
        clearTimeout(heartbeat);
        heartbeat = undefined;
        if (worm.move()) {
          heartbeat = setTimeout(tick, heartrate);
        } else {
          $('#top > span').toggleClass('active');
          reset();
        }
      };

  reset = function () {
    if (typeof heartbeat !== "undefined") {
      clearTimeout(heartbeat);
      heartbeat = undefined;
    }
    world.createGrid();
    worm.birth();
  };

  // Control events below

  $(document).on("keydown", function (ev) {
    var vector = [0, 0];
    switch (ev.which) {
      case 37: case 65: worm.go([-1, 0]); break;
      case 38: case 87: worm.go([0, -1]); break;
      case 39: case 68: worm.go([1, 0]); break;
      case 40: case 83: worm.go([0, 1]); break;
      default: return;
    }
  });

  reset();
});
