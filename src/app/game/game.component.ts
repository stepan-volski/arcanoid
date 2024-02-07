import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  constructor(private renderer: Renderer2) {}

  rows = Array.from({ length: 15 });
  cells = Array.from({ length: 25 });

  map: { [id: string]: number } = {};
  currentPosition = '13:4';
  prevPosition = '';
  direction = '1:1';
  interval: any;
  isDevMode = true;

  ngOnInit(): void {
    this.initMap();
    this.drawBallInCurrentPosition();
  }

  initMap() {
    for (let i = 0; i < this.rows.length; i++) {
      let leftId = i + ':' + 0;
      let rightId = i + ':' + (this.cells.length - 1);
      this.map[leftId] = 2;
      this.map[rightId] = 2;
    }

    for (let i = 0; i< this.cells.length; i++) {
      let topId = 0 + ':' + i;
      let bottomId = (this.rows.length - 1) + ':' + i;
      this.map[topId] = 2;
      this.map[bottomId] = 2;
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

  placeWallAfterClick(id: string){
    this.map[id] = 2;
  }

  updateDirection() {
    let tmp = [...this.getThreeNextCellsInCurrentDirection()];
    let cells = [this.isCellEmpty(tmp[0]), this.isCellEmpty(tmp[1]), this.isCellEmpty(tmp[2])];

    const x = +this.direction.split(':')[0];
    const y = +this.direction.split(':')[1];

    let newX = 0;
    let newY = 0;

    switch (cells.join(':')) {
      //collision from the left
      case '1:0:0':
      case '1:1:0':
        if (this.direction === '-1:-1' || this.direction === '1:1') {
          newX = x;
          newY = -y; //change only up/down direction to opposite
        } else {
          newX = -x; //change only right/left direction to opposite
          newY = y;
        }
        break;

      //collision from the right
      case '0:0:1':
      case '0:1:1':
        if (this.direction === '-1:-1' || this.direction === '1:1') {
          newX = -x;  //change only right/left direction to opposite
          newY = y;
        } else {
          newX = x;
          newY = -y; //change only up/down direction to opposite
        }
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

  print(){
    console.log('direction: ' + this.direction);
    console.log('current position: ' + this.currentPosition);
    let cells = [...this.getThreeNextCellsInCurrentDirection()];
    console.log('left cell: ' + cells[0]);
    console.log('middle cell: ' + cells[1]);
    console.log('right cell: ' + cells[2]);
  }


  getThreeNextCellsInCurrentDirection() {
    let cells: string[] = [];

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

    cells.push(leftCell);
    cells.push(middleCell);
    cells.push(rightCell);

    return cells;
  }

  isCellEmpty(id: string) {
    if (this.map[id] === 2) {
      return 1
    }

    return 0;
  }

  stop(){
    clearInterval(this.interval);
  }

  start(){
    this.interval = setInterval(()=> this.move(), 100);
  }

  toggleDevMode(){
    this.isDevMode = !this.isDevMode;
  }
}
