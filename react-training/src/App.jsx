import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function MyButton() {
  
    const [name, setName] = useState('yes');
  

  return (
    <button onClick={() => setName((name) => name === 'yes' ? 'no' : 'yes')}>
      Click me {name}
    </button>
  );
}

const products = [
  { title: 'Cabbage', id: 1 },
  { title: 'Garlic', id: 2 },
  { title: 'Apple', id: 3 },
];

function AppTest() {
  const listItems = products.map(product =>
  <li key={product.id}>
    {product.title}
  </li>
);

  return (<>
    <MyButton />
    <p>Products:</p>
      <ul>{listItems}</ul>
    </>
  );
}

export default AppTest
