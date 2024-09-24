import { createContext, useState, useEffect } from 'react';


const AuthContext = createContext({});

const AuthProvider = (props) => {
  
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const [auth, setAuth] = useState(storedUser || {});

  const [cartitems, setCartitems] = useState([]);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(auth));
  }, [auth]); 

  return (
    <AuthContext.Provider value={{ auth, setAuth, cartitems, setCartitems }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export { AuthContext };
