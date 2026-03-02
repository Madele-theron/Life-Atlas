import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalDashboard from './pages/GlobalDashboard';
import WealthDashboard from './pages/Wealth/WealthDashboard';
import FinancialTracker from './pages/Wealth/FinancialTracker';
import CashFlow from './pages/Wealth/CashFlow';
import Assets from './pages/Wealth/Assets';
import Goals from './pages/Wealth/Goals';
import Knowledge from './pages/Wealth/Knowledge';
import Course from './pages/Wealth/Course';
import HealthDashboard from './pages/Health/HealthDashboard';
import Fitness from './pages/Health/Fitness';
import Longevity from './pages/Health/Longevity';
import Mind from './pages/Health/Mind';
import AscentDashboard from './pages/Ascent/AscentDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<GlobalDashboard />} />

          {/* Wealth Module */}
          <Route path="wealth">
            <Route index element={<WealthDashboard />} />
            <Route path="tracker" element={<FinancialTracker />} />
            <Route path="cash-flow" element={<CashFlow />} />
            <Route path="assets" element={<Assets />} />
            <Route path="goals" element={<Goals />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="course" element={<Course />} />
          </Route>

          {/* Health Module */}
          <Route path="health">
            <Route index element={<HealthDashboard />} />
            <Route path="fitness" element={<Fitness />} />
            <Route path="longevity" element={<Longevity />} />
            <Route path="mind" element={<Mind />} />
          </Route>

          {/* Placeholders for other Life Areas */}
          <Route path="love" element={<div className="mb-8"><h1>Love Center</h1><p>Coming soon...</p></div>} />
          <Route path="self" element={<div className="mb-8"><h1>Self Center</h1><p>Coming soon...</p></div>} />

          {/* The Ascent Module */}
          <Route path="ascent" element={<AscentDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
