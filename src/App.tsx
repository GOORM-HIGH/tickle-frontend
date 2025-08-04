import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isLoggedIn } = useAuth();
  
  return isLoggedIn ? <MainPage /> : <LoginPage />;
}

export default App;
