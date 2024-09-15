import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import WalletInfo from "./pages/WalletInfo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/info" element={<WalletInfo />} />
      </Routes>
    </Router>
  );
}

export default App;
