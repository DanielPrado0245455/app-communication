import React, { useState, useEffect } from 'react';
import Logo from './assets/Logo.png';
import './styles/SignUp.scss';

function SignUp() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [elobby, setElobby] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/elobbies/',{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      setElobby(data[0].name);
      console.log(data[0].name);
    })
  }, []);
  const handleSignUp = () => {
    // Valida que se hayan ingresado todos los campos
    if (!username || !nickname || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    // Crea un objeto con los datos del nuevo usuario
    const newUser = {
      username,
      password,
      nickname,
      elobby
    };
    console.log(newUser);

    // Realiza una solicitud POST al servidor para registrar el nuevo usuario
    fetch('/api/usuarios/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to register user');
      }
      // Redirige al usuario a la página principal después del registro exitoso
      window.location.href = `/principal/${username}`;
    })
    .catch(error => {
      console.error('Error registering user:', error);
      // Muestra un mensaje de error en caso de fallo en el registro
      setError('Error al registrar usuario. Por favor, intenta nuevamente.');
    });
  };

  return (
    <div className="SignUp">
      <div className="form">
        <h1 className="saludo">Hola!</h1>
        <p className="instruccion">Ingresa tus datos para registrarse</p>
        <input
          type="text"
          className="input"
          placeholder="Correo electrónico"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          className="input"
          placeholder="Apodo"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
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
          value="Registrarse"
          onClick={handleSignUp}
        />
      </div>
      <div className="background">
        <h1 className="bienvenida">Bienvenido a</h1>
        <img className="logo" alt="logo" src={Logo} />
        <h2 className="empresa">Pimientos Company IS de GC</h2>
        <h3 className="chat">ChatRoom</h3>
      </div>
    </div>
  );
}

export default SignUp;
