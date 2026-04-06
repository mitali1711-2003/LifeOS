/**
 * App — the root component that sets up routing.
 * All pages are rendered inside the Layout (which has the Sidebar).
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Finance from './pages/Finance';
import Experiments from './pages/Experiments';
import Learning from './pages/Learning';
import StudyBuddy from './pages/StudyBuddy';
import Ideas from './pages/Ideas';
import Journal from './pages/Journal';
import Bookmarks from './pages/Bookmarks';
import Games from './pages/Games';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps all pages — Sidebar is always visible */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/study" element={<StudyBuddy />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/games" element={<Games />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
