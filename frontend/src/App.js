import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Homepage";
import RecordPage from "./RecordPage";
import StatisticsPage from "./StatisticsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
