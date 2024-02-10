import { Component, OnInit, } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  constructor() {}

  rows = Array.from({ length: 30 });
  cells = Array.from({ length: 50 });

  map: { [id: string]: number } = {};
  balls: { [id: string]: {
    currentPosition: string,
    prevPosition: string,
    direction: string
  }
  } = {};

  interval: any;
  isDevMode = false;
  ballIds: string[] = [];

  ngOnInit(): void {
    this.initMap();
    this.initBalls();
  }

  initBalls(){
    let ball0 = {
      currentPosition: '12:4',
      prevPosition: '',
      direction: '1:1'
    }

    let ball1 = {
      currentPosition: '17:35',
      prevPosition: '',
      direction: '-1:-1'
    }


    this.balls['0'] = ball0;
    this.drawBallInCurrentPosition('0');
    this.ballIds.push('0');


    this.balls['1'] = ball1;
    this.ballIds.push('1');
    this.drawBallInCurrentPosition('1');
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

    //build stones
    for (let i = 1; i < this.rows.length - 1; i++) {
      for (let j = 1; j < this.cells.length / 2; j++) {
        let id = i + ':' + j;
        this.map[id] = 4;
      }
    }
  }

  getCellClass(id: string) {
    switch (this.map[id]) {
      case 0: return 'brickBall';
      case 1: return 'stoneBall';
      case 2: return 'wall';
      case 3: return 'brick';
      case 4: return 'stone';
      default: return 'cell';
    }
  }

  move() {
    for (let ball of this.ballIds) {
      this.updateDirection(ball);
      this.moveInDirection(ball);
      this.drawBallInCurrentPosition(ball);
    }
  }

  //todo: prettify
  drawBallInCurrentPosition(id: string) {
    let prevCell: number;
    let ballType: number;

    if(id==='0') {
      prevCell = 4;
      ballType = 0;
    }

    if(id==='1') {
      prevCell = 3;
      ballType = 1;
    }

    this.map[this.balls[id].prevPosition] = prevCell!;
    this.map[this.balls[id].currentPosition] = ballType!;
  }

  moveInDirection(id: string) {
    let currentPosition = this.balls[id].currentPosition;
    let direction = this.balls[id].direction;

    const bRow = +currentPosition.split(':')[0];
    const bCol = +currentPosition.split(':')[1];
    const xDir = +direction.split(':')[0];
    const yDir = +direction.split(':')[1];
    let newXPos, newYPos;

    if (direction === '1:1' || direction === '-1:-1') {
      newXPos = bRow - xDir;
      newYPos = bCol + yDir;
    } else {
      newXPos = bRow + xDir;
      newYPos = bCol - yDir;
    }

    this.setPosition(id, newXPos + ':' + newYPos);
  }

  setDirection(id: string, direction: string) {
    this.balls[id].direction = direction;
  }

  setPosition(id: string, position: string) {
    this.balls[id].prevPosition = this.balls[id].currentPosition;
    this.balls[id].currentPosition = position;
  }

  updateDirection(id: string) {
    let cells = [...this.getThreeNextCellsInCurrentDirection(id)];
    let binaryCells = this.getBinaryCells(id, cells); //to see if cell has any object or not
    let direction = this.balls[id].direction;

    const x = +direction.split(':')[0];
    const y = +direction.split(':')[1];

    let newX = 0;
    let newY = 0;

    switch (binaryCells.join(':')) {
      //collision from the left
      case '1:0:0':
      case '1:1:0':
        if (direction === '-1:-1' || direction === '1:1') {
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
        if (direction === '-1:-1' || direction === '1:1') {
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

    this.handleCellCollision(id, cells);
    this.setDirection(id, newX + ':' + newY);

  }

  print(id: string){
    console.log('ball id: ' + id)
    console.log('direction: ' + this.balls[id].direction);
    console.log('current position: ' + this.balls[id].currentPosition);
    let cells = [...this.getThreeNextCellsInCurrentDirection(id)];
    console.log('left cell: ' + cells[0]);
    console.log('middle cell: ' + cells[1]);
    console.log('right cell: ' + cells[2]);

    console.log(this.getBinaryCells('1',cells));
    console.log(this.map[cells[0]]);
    console.log(this.map[cells[1]]);
    console.log(this.map[cells[2]]);
  }


  getThreeNextCellsInCurrentDirection(id: string) {
    let cells: string[] = [];
    let currentPosition = this.balls[id].currentPosition;
    let direction = this.balls[id].direction;

    const ballRow = +currentPosition.split(':')[0];
    const ballCol = +currentPosition.split(':')[1];

    let leftCell = '';
    let rightCell = '';
    let middleCell = '';

    switch(direction) {
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

  //TODO prettify
  handleCellCollision(id: string, cells: string[]) {

    for (let cell of cells) {
      if (id === '0' && this.map[cell] === 3) {
        this.map[cell] = 4;
      }
      if (id === '1' && this.map[cell] === 4) {
        this.map[cell] = 3;
      }
    }
  }


  //TODO prettify ball type selection
  getBinaryCells(id: string, cells: string[]){
    let arr: any[] = [];

    if (id === '0') {
      cells.forEach(cell => {
        if (this.map[cell] === 0 || this.map[cell] === 1 || this.map[cell] === 2 || this.map[cell] === 3) {
          arr.push('1');
        } else {
          arr.push('0')
        }
      })
    } else {
      cells.forEach(cell => {
        if (this.map[cell] === 0 || this.map[cell] === 1 || this.map[cell] === 2 || this.map[cell] === 4) {
          arr.push('1');
        } else {
          arr.push('0')
        }
      })
    }
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

  placeBrick(id: string){

    if(this.map[id] === 3) {
      this.map[id] = 4;
    } else if(this.map[id] === 4) {
      this.map[id] = 3;
    }
  };

}

