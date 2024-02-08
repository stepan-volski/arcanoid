import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  constructor(private renderer: Renderer2) {}

  rows = Array.from({ length: 30 });
  cells = Array.from({ length: 50 });

  map: { [id: string]: number } = {};
  currentPosition = '13:4';
  prevPosition = '';
  direction = '1:1';
  interval: any;
  isDevMode = false;

  ngOnInit(): void {
    this.initMap();
    this.drawBallInCurrentPosition();
  }

  initMap() {
    //build walls
    for (let i = 0; i < this.rows.length; i++) {
      let leftId = i + ':' + 0;
      let rightId = i + ':' + (this.cells.length - 1);
      this.map[leftId] = 2;
      this.map[rightId] = 2;
    }
    //build walls
    for (let i = 0; i< this.cells.length; i++) {
      let topId = 0 + ':' + i;
      let bottomId = (this.rows.length - 1) + ':' + i;
      this.map[topId] = 2;
      this.map[bottomId] = 2;
    }
    //build bricks
    for (let i = 1; i < this.rows.length - 1; i++) {
      for (let j = this.cells.length / 2; j < this.cells.length - 1; j++) {
        let id = i + ':' + j;
        this.map[id] = 3;
      }
    }
  }

  getCellClass(id: string) {
    switch (this.map[id]) {
      case 1: return 'ball';
      case 2: return 'wall';
      case 3: return 'brick';
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
    this.map[id] = 3;
  }

  updateDirection() {
    let cells = [...this.getThreeNextCellsInCurrentDirection()];
    let binaryCells = this.getBinaryCells(cells); //to see if cell has any object or not

    const x = +this.direction.split(':')[0];
    const y = +this.direction.split(':')[1];

    let newX = 0;
    let newY = 0;

    switch (binaryCells.join(':')) {
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

    this.handleCellCollision(cells);
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

  handleCellCollision(cells: string[]) {
    for (let cell of cells) {
      if (this.map[cell] === 3) {
        this.map[cell] = 0;
      }
    }
  }

  getBinaryCells(cells: string[]){
    let arr: any[] = [];

    cells.forEach(cell => {
      if (this.map[cell] === 1 || this.map[cell] === 2 || this.map[cell] === 3) {
        arr.push('1');
      } else {
        arr.push('0')
      }
    })
    return arr;
  }

  stop(){
    clearInterval(this.interval);
  }

  start(){
    this.interval = setInterval(()=> this.move(), 30);
  }

  toggleDevMode(){
    this.isDevMode = !this.isDevMode;
  }
}
