// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Login from './Login';
import Principal from './Principal';
import SignUp from './SignUp';

function App() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/usuarios/')
      .then(response => response.json())
      .then(data => {
        setUsers(data); // Ajuste para la estructura de datos proporcionada
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []); // Asegúrate de tener el arreglo de dependencias vacío para que se ejecute solo una vez

  const handleLogin = (username, password, navigate) => {
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
      navigate(`/principal/${user.username}`); // Redirige a la página principal con el userId en la URL
    } else {
      alert("Nombre de usuario o contraseña incorrectos");
    }
  };

  return (
    <BrowserRouter className="App">
      <Routes>
        <Route
          path="/"
          element={<Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/principal/:userId" // Incluye el userId en la ruta
          element={<Principal />} 
        />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
