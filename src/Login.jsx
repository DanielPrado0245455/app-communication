import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"; // Importa useNavigate desde react-router-dom
import "./styles/Login.scss";
import Logo from "./assets/Logo.png";

function Login({ onLogin }) { // Elimina navigate de la lista de props
  const navigate = useNavigate(); // Utiliza useNavigate dentro del componente para la navegación
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = () => {
    // Validar que se haya ingresado un nombre de usuario y una contraseña
    if (!username || !password) {
      setError('Por favor, ingrese un nombre de usuario y una contraseña.');
      return;
    }

    // Llamar a la función de autenticación proporcionada con el nombre de usuario y la contraseña
    const isAuthenticated = onLogin(username, password, navigate); // Pasa navigate como argumento
    if (!isAuthenticated) {
      setError('Nombre de usuario o contraseña incorrectos.');
    }
  };

  const handleRegisterClick = () => {
    navigate('/signup'); // Navegar a la página de registro al hacer clic en el botón de registro
  };

  return (
    <div className="Login">
      <div className="background">
        <h1 className="bienvenida">Bienvenido a</h1>
        <img className="logo" alt="logo" src={Logo} />
        <h2 className="empresa">Pimientos Company IS de GC</h2>
        <h3 className="chat">ChatRoom</h3>
      </div>
      <div className="form">
        <h1 className="saludo">Hola!</h1>
        <p className="instruccion">Ingresa tus datos para ingresar</p>
        <input
          type="text"
          className="input"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="input"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <input
          type="button"
          className="ingresarBtn"
          value="Ingresar"
          onClick={handleLoginSubmit}
        />
        <input
          type="button"
          className="registrarseBtn" // Estiliza este botón según sea necesario
          value="Registrarse"
          onClick={handleRegisterClick}
        />
      </div>
    </div>
  );
}

export default Login;
