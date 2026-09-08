import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Experiments from './pages/Experiments.jsx'
import ExperimentPlay from './pages/ExperimentPlay.jsx'
import Concepts from './pages/Concepts.jsx'
import ConceptDetail from './pages/ConceptDetail.jsx'
import Record from './pages/Record.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/experiments/:labId" element={<ExperimentPlay />} />
        <Route path="/concepts" element={<Concepts />} />
        <Route path="/concepts/:conceptId" element={<ConceptDetail />} />
        <Route path="/record" element={<Record />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
