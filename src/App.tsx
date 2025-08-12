import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CuriousClaude from './pages/CuriousClaude';
import AbsenceNavigator from './pages/AbsenceNavigator';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/curious" element={<CuriousClaude />} />
      <Route path="/absence" element={<AbsenceNavigator />} />
      <Route path="/absense" element={<AbsenceNavigator />} />
    </Routes>
  );
}

export default App;
