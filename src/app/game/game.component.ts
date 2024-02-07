import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  constructor(private renderer: Renderer2) {}

  rows = Array.from({ length: 15 });
  cells = Array.from({ length: 15 });

  map: { [id: string]: number } = {};
  currentPosition = '13:4';
  prevPosition = '0:0';
  direction = '1:1';

  ngOnInit(): void {
    this.initMap();
    this.drawBallInCurrentPosition();
    //this.move();
    //setInterval(()=> this.move(), 100);
  }

  initMap() {
    for (let i = 0; i < 15; i++) {
      let topId = 0 + ':' + i;
      let bottomId = 14 + ':' + i;
      let leftId = i + ':' + 0;
      let rightId = i + ':' + 14;

      this.map[topId] = 2;
      this.map[bottomId] = 2;
      this.map[leftId] = 2;
      this.map[rightId] = 2;
    }
  }

  getClassForCell(id: string) {
    switch (this.map[id]) {
      case 1: return 'ball';
      case 2: return 'wall';
      default: return 'cell';
    }
  }

  move() {
      this.updateDirection();
      this.moveInDirection();
      this.drawBallInCurrentPosition();
  }

  drawBallInCurrentPosition() {
    this.map[this.prevPosition] = 0;
    this.map[this.currentPosition] = 1;
  }

  moveInDirection() {
    const bRow = +this.currentPosition.split(':')[0];
    const bCol = +this.currentPosition.split(':')[1];
    const xDir = +this.direction.split(':')[0];
    const yDir = +this.direction.split(':')[1];
    let newXPos, newYPos;

    //TODO to prettify
    if (this.direction === '1:1' || this.direction === '-1:-1') {
      newXPos = bRow - xDir;
      newYPos = bCol + yDir;
    } else {
      newXPos = bRow + xDir;
      newYPos = bCol - yDir;
    }

    this.setPosition(newXPos, newYPos);
  }

  setDirection(x: number, y: number) {
    this.direction = x + ':' + y;
  }

  setPosition(x: number, y: number) {
    this.prevPosition = this.currentPosition;
    this.currentPosition = x + ':' + y;
  }

  placeBallAfterClick(id: string){
    this.setPosition(+id.split(':')[0],+id.split(':')[1]);
    this.drawBallInCurrentPosition();
  }

  updateDirection() {
    let walls = this.getThreeNextCellsInCurrentDirection();

    const x = +this.direction.split(':')[0];
    const y = +this.direction.split(':')[1];

    let newX = 0;
    let newY = 0;

    switch (walls.join(':')) {
      case '1:0:0':
      case '1:1:0':
        newX = x;
        newY = -y;
        break;

      case '0:0:1':
      case '0:1:1':
        newX = -x;
        newY = y;
        break;

      case '0:1:0':
      case '1:1:1':
      case '1:0:1':
        newX = -x;
        newY = -y;
        break;

      case '0:0:0':
        newX = x;
        newY = y;
        break;
    }

    this.setDirection(newX, newY);

  }

  printt(){
    console.log('direction: ' + this.direction);
    console.log('current position: ' + this.currentPosition);
    this.getThreeNextCellsInCurrentDirection();
  }


  getThreeNextCellsInCurrentDirection() {
    let cells: number[] = [];

    const ballRow = +this.currentPosition.split(':')[0];
    const ballCol = +this.currentPosition.split(':')[1];

    let leftCell = '';
    let rightCell = '';
    let middleCell = '';

    switch(this.direction) {
      case '1:1':
      leftCell = (ballRow - 1) + ':' + ballCol;
      rightCell = ballRow + ':' + (ballCol + 1);
      middleCell = (ballRow - 1) + ':' + (ballCol + 1);
      break;

      case '1:-1':
      leftCell = ballRow + ':' + (ballCol + 1);
      rightCell = (ballRow + 1) + ':' + ballCol;
      middleCell = (ballRow + 1) + ':' + (ballCol + 1);
      break;

      case '-1:1':
      leftCell = ballRow + ':' + (ballCol - 1);
      rightCell = (ballRow - 1) + ':' + ballCol;
      middleCell = (ballRow - 1) + ':' + (ballCol - 1);
      break;

      case '-1:-1':
      leftCell = (ballRow + 1) + ':' + ballCol;
      rightCell = ballRow + ':' + (ballCol - 1);
      middleCell = (ballRow + 1) + ':' + (ballCol - 1);
      break;
    }

    cells.push(this.isCellEmpty(leftCell));
    cells.push(this.isCellEmpty(middleCell));
    cells.push(this.isCellEmpty(rightCell));

    console.log('left cell: ' + leftCell);
    console.log('right cell: ' + rightCell);
    console.log('middle cell: ' + middleCell);

    return cells;
  }

  isCellEmpty(id: string) {
    if (this.map[id] === 2) {
      return 1
    }

    return 0;
  }
}
