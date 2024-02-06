import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  constructor(private renderer: Renderer2) {}

  rows = Array.from({ length: 15 });
  cells = Array.from({ length: 15 });

  map: {[id: string]: number} = {};

  // ngSwitch, set cell class depending on cell value in array; 0 = empty, 1 = ball, 3 = wall


  ngOnInit(): void {
    this.initMap();

    this.map['2:4'] = 1;
  }

  initMap(){
    for (let i = 0; i < 100; i++) {
      this.map[i] = 0;
    }
  }

  getCellById(id: string): HTMLElement | null {
    const cellElements = document.querySelectorAll(`[id="${id}"]`);

    if (cellElements.length > 0) {
      return cellElements[0] as HTMLElement;
    }

    return null;
  }

  placeBallInCell(id: string) {
    const cell = this.getCellById(id);
    console.log(cell)
    this.renderer.addClass(cell, 'ball');
  }

  removeBallFromCell(id: string) {
    const cell = this.getCellById(id);
    this.renderer.removeClass(cell, 'ball');
  }

  getClassForCell(id: string) {
    switch (this.map[id]) {
      case 1: return 'ball';
      default: return 'cell';
    }
  }


  currentPosition = '4:7';    //ball position => row:col
  direction = '1:1'  //1:1 -1:1 -1:-1 1:-1 => x:y


  move() {
    while(true) {
      this.updateDirection();
      this.updatePosition();  // = move in current direction
    }
  }

  updatePosition() {
    this.getThreeNextCellsInCurrentDirection();
    // move to the middle one
  }

  updateDirection(){
    let walls = this.getThreeNextCellsInCurrentDirection(); //[1, 0, 1]




    //change direction according to obstacles
  }

  getThreeNextCellsInCurrentDirection() {
    let walls: number[] = []; //e.g. [0, 1, 0]

    const x = +this.direction.split(':')[0];
    const y = +this.direction.split(':')[1];
    const ballRow = +this.currentPosition.split(':')[0];
    const ballCol = +this.currentPosition.split(':')[1];

    const leftCell = (ballRow + y) + ':' + (ballCol - x);
    const rightCell = (ballRow - y) + ':' + (ballCol + x);
    const middleCell = (ballRow + y) + ':' + (ballCol + x);

    walls.push(this.isCellEmpty(leftCell));
    walls.push(this.isCellEmpty(rightCell));
    walls.push(this.isCellEmpty(middleCell));

    //currentPosition = row:col
    //direction = X:Y (1:-1)

    //up-right dir (1:1)
    // left: row = b.row-1; col = b.col
    // rigt: row = b.row; col = b.col+1
    // center: row = b.row-1; col = b.col+1

    //down-right dir (1:-1)
    // left: row = b.row; col = b.col+1
    // rigt: row = b.row+1; col = b.col
    // center: row = b.row+1; col = b.col+1

    //up-LEFT dir(-1:1):
    // left: row = b.row; col = b.col-1
    // rigt: row = b.row-1; col = b.col
    // center: row = b.row-1; col = b.col-1

    //down-right dir (-1:-1)
    // left: row = b.row+1; col = b.col
    // rigt: row = b.row; col = b.col-1
    // center: row = b.row+1; col = b.col-1

   return walls;
  }

  isCellEmpty(id: string) {
    //returns 0 if cell is empty or 1 if collision should change ball direction
    return 1;
  }


}



// 4 directions left/right up/down
// move:
// 1) check area in front according to direction (3 squares in corner)
// 2) if no walls -> move in the way of direction
// 3) if a wall -> change direction
// 4) repeat steps
