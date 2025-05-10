import { useEffect, useState, useRef } from 'react'
import Die from './die'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'

export default function App() {
  function generateAllNewDice() {
    return new Array(10).fill().map(() => ({
      value: Math.floor(Math.random() * 6) + 1,
      isHeld: false,
      id: crypto.randomUUID()
    }))
  }

  const [dice, setDice] = useState(() => generateAllNewDice())
  const [gameStarted, setGameStarted] = useState(false)
  const [correctNumber, setCorrectNumber] = useState(null)
  const { width, height } = useWindowSize()
  const gameWon = dice.every(die => die.isHeld) && dice.every(die => die.value === dice[0].value)
  const newGame = useRef(null)

  useEffect(() => {
    if (gameWon) {
      newGame.current.focus()
    }
  }, [gameWon])

  function handleClick() {
    if (!gameStarted) setGameStarted(true)
    if (gameWon) {
      setDice(generateAllNewDice())
      setGameStarted(false)
      setCorrectNumber(null)
    } else {
      setDice(prevDice => prevDice.map(die =>
        die.isHeld ? die : { ...die, value: Math.floor(Math.random() * 6) + 1 }
      ))
    }
  }

  function hold(id) {
    setDice(prevDice => {
      const newDice = prevDice.map(die => {
        if (die.id === id) {
          const newHeldState = !die.isHeld
          if (newHeldState && correctNumber === null) {
            setCorrectNumber(die.value)
          }
          return { ...die, isHeld: newHeldState }
        }
        return die
      })
      return newDice
    })
  }

  const diceElements = dice.map(die => (
    <Die
      key={die.id}
      id={die.id}
      value={die.value}
      isHeld={die.isHeld}
      isIncorrect={die.isHeld && correctNumber !== null && die.value !== correctNumber}
      hold={() => hold(die.id)}
    />
  ))

  return (
    <main>
      {gameWon && width && height && <ReactConfetti width={width} height={height} />}
      <div aria-live='polite' className='congrats'>
        {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
      </div>
      <h1 className='title'>Tenzies</h1>
      <p className='instructions'>Roll until all the dice are the same. Click each die to freeze it at its current value between rolls.</p>
      <div className="container">
        {diceElements}
      </div>
      <button className="re-roll" onClick={handleClick} ref={newGame}>
        {gameWon ? "New Game" : "Roll"}
      </button>
    </main>
  )
}