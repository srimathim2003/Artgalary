
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import AuthProvider from './context/AuthProvider';
import ArtworkForm from './Pages/ArtworkForm'
import UserProfile from './Pages/UserProfile';
import Payment from './Pages/Payment';


function App() {
  
  const userObject = JSON.parse(localStorage.getItem('user')); 

  const accessToken = userObject ? userObject.accessToken : null;
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={(accessToken )? <Dashboard /> : <Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/dash' element={<Dashboard />} />
          <Route path='/art-form' element={<ArtworkForm />} />
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/payment' element={<Payment />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
