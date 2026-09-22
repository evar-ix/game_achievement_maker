import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ActivityGenerationPage } from "./components/ActivityGeneration/ActivityGenerationPage";
import GameSelectionPage from "./pages/GameSelectionPage";
import GameAnalysisPage from "./pages/GameAnalysisPage";
import DeveloperMonitoringPage from "./pages/DeveloperMonitoringPage";
import PlayerLearningPage from "./pages/PlayerLearningPage";
import { AppLayout } from "./learning/AppLayout";
import { DemoSessionProvider } from "./learning/DemoSessionContext";
import "./pages/LearningPages.css";

function App() {
  return (
    <BrowserRouter>
      <DemoSessionProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/games" replace />} />
            <Route path="/games" element={<GameSelectionPage />} />
            <Route
              path="/games/:gameId/analysis"
              element={<GameAnalysisPage />}
            />
            <Route
              path="/games/:gameId/activities"
              element={<ActivityGenerationPage />}
            />
            <Route
              path="/games/:gameId/monitoring"
              element={<DeveloperMonitoringPage />}
            />
            <Route
              path="/games/:gameId/learn"
              element={<PlayerLearningPage />}
            />
          </Route>
        </Routes>
      </DemoSessionProvider>
    </BrowserRouter>
  );
}

export default App;
