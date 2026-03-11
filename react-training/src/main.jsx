import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
//import TicTacToe from '../public/test code/TicTacToe.jsx';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const myColor = [
  '#effde7',
  '#e1f8d4',
  '#c3efab',
  '#a2e67e',
  '#87de58',
  '#75d93f',
  '#6bd731',
  '#59be23',
  '#4da91b',
  '#3d920d'
];

const theme = createTheme({
  autoContrast : true,
  defaultRadius: 'md',
  colors: {
    myColor,
  },
  primaryColor: 'myColor',
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>,
)
