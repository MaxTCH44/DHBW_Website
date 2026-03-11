import './TicTacToe.css';
import {useState, useEffect} from 'react';

function Square({value, onSquareClick, color}) {
    return (
        <button className="square" onClick={onSquareClick} style={{backgroundColor: color}}>{value}</button>
    );
    }

function Board({ xIsNext, squares, onPlay, location, opponent }) {

    const winner = calculateWinner(squares);
    let status;
    let winning_squares = [];
    if (winner) {
        status = "Winner: " + winner[0];
        winning_squares = winner[1];
    } else {
        if (squares.includes(null)){
        status = "Next player: " + (xIsNext ? "X" : "O");
        } else {
             status = "Draw";
        }
    }

    function opponentPlay(squares) {
        let possibilities = [];
        squares.map((value,index) =>
            value ? null : (possibilities = [...possibilities, index]));
        handleClick(possibilities[Math.floor(Math.random() * possibilities.length)])
        return;
    }

    function handleClick (i) {
        if (squares[i] || calculateWinner(squares)) {return;}
        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = "X";
        } else {
            nextSquares[i] = "O";
        }
        onPlay(nextSquares, i);
    }

    useEffect(() => {
        if((opponent === 'X' && xIsNext) || (opponent === 'O' && !xIsNext)) {
            const timer = setTimeout(() => opponentPlay(squares), 500);
            return () => clearTimeout(timer);
        }
    }, [opponent, xIsNext, squares, onPlay]);

    return (<>
    <div className="status">{status}</div>
    {[0,1,2].map((_,i) =>  
        <div className="board-row" key={i}>
        {[0,1,2].map((_,j) =>  
            <Square value = {squares[3*i+j]} onSquareClick = {() => handleClick(3*i+j)} key={3*i+j} color = {winning_squares.includes(3*i+j) ? ('green') : (3*i+j === location ? ('yellow') : ('white'))}/>
        )}
    </div>)}
    {/*<div className="board-row">
        <Square value = {squares[0]} onSquareClick = {() => handleClick(0)}/>
        <Square value = {squares[1]} onSquareClick = {() => handleClick(1)}/>
        <Square value = {squares[2]} onSquareClick = {() => handleClick(2)}/>
    </div>
    <div className="board-row">
        <Square value = {squares[3]} onSquareClick = {() => handleClick(3)}/>
        <Square value = {squares[4]} onSquareClick = {() => handleClick(4)}/>
        <Square value = {squares[5]} onSquareClick = {() => handleClick(5)}/>
    </div>
    <div className="board-row">
        <Square value = {squares[6]} onSquareClick = {() => handleClick(6)}/>
        <Square value = {squares[7]} onSquareClick = {() => handleClick(7)}/>
        <Square value = {squares[8]} onSquareClick = {() => handleClick(8)}/>
    </div>*/}
    </>);
}

export default function Game() {
    const [opponent, setOpponent] = useState(() => Math.random() < 0.5 ? ('X') : ('O'));
    const [history, setHistory] = useState([{ squares: Array(9).fill(null), location: null }]);
    const [currentMove, setCurrentMove] = useState(0);
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove].squares;
    const currentLocation = history[currentMove].location;
    const [order, setOrder] = useState(true);

    function handlePlay(nextSquares, moveLocation) {
        const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, location: moveLocation }];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }
    const moves = history.map((step, move) => {
        let description;
        const loc = step.location;
        const row = 3 - Math.floor(loc / 3);
        const col = (loc % 3) + 1;
        if (move > 0) {
        description = 'Go to move #' + move + ' (' + col + ',' + row + ')';
        } else {
        description = 'Go to game start';
        }
        return (
        <li key={move}>
            {move === currentMove ? (<p>You are at move #{move + (move === 0 ? ('') : (' (' + col + ',' + row + ')'))}</p>) : (<button onClick={() => jumpTo(move)}>{description}</button>)}
        </li>
        );
    });

    const sortedMoves = order ? moves : [...moves].reverse();

    return (
        <div className="game">
        <div className='player'>You play with the {opponent === 'X' ? ('O') : ('X')}</div>
        <div className="game-board">
            <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} location={currentLocation} opponent={opponent} />
        </div>
        <div className="game-info">
            <button style = {{backgroundColor: 'yellow'}} onClick={() => setOrder(!order)}>{order ? ('Set order to descending') : ('Set order to ascending')}</button>
            <ol>{sortedMoves}</ol>
        </div>
        </div>
    );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], [a, b, c]];
    }
  }
  return null;
}