import { LoginPage } from './pages/LoginPage';
import { MainPage } from './pages/MainPage';
import TotalRouter from './totalpage/TotalRouter';
import { useAuth } from './hooks/useAuth';

function App() {
  // const { isLoggedIn } = useAuth();
  
  
  return <TotalRouter />;
}

export default App;
