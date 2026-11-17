import { BrowserRouter as Router, Routes, Route } from 'react-router'
import Menu from './components/Menu'
import AnecdoteList from './components/AnecdoteList'
import About from './components/About'
import Footer from './components/Footer'
import CreateNew from './components/CreateNew'
import AnecdotesProvider from './hooks/AnecdotesProvider'

const App = () => {
  return (
    <Router><AnecdotesProvider>
      <div>
        <h1>Software anecdotes</h1>
        <Menu />
        <Routes>
          <Route path="/" element={<AnecdoteList />} />
          <Route path="/create" element={<CreateNew />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer />
      </div>
    </AnecdotesProvider></Router>
  )
}

export default App
