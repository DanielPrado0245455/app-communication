// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Login from './Login';
import Principal from './Principal';
import SignUp from './SignUp';
import { cipher } from './utils/clientCipher';
import { decipher } from './utils/serverDecipher';

function App() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('/api/usuarios/')
      .then(response => response.text()) // Convert response to text
      .then(text => {
        const decipheredText = decipher(text, 1); // Apply your decipher function here
        return JSON.parse(decipheredText); // Convert the deciphered text to JSON
      })
      .then(data => {
        setUsers(data); // Update state with the fetched data
        console.log('Fetched users:', data);
      })
      .catch(error => console.error('Error fetching users:', error)); // Handle any errors during the fetch operation
  }, []); // Empty dependency array ensures this effect runs only once on component mount
  

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
