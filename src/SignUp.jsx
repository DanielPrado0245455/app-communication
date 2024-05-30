import React, { useState, useEffect } from 'react';
import Logo from './assets/Logo.png';
import './styles/SignUp.scss';
import { decipher } from './utils/serverDecipher';
import { cipher } from './utils/clientCipher';

function SignUp() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [elobby, setElobby] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/elobbies/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.text())  // Get the response as text
    .then(data => {
      const decipheredData = decipher(data, 1); // Decipher the data
      const parsedData = JSON.parse(decipheredData); // Parse the deciphered data as JSON
      const elobbyName = parsedData[0].name; // Get the name of the first element
      setElobby(elobbyName); // Set the elobby state
      console.log(elobbyName); // Log the elobby name
    })
    .catch(error => console.error('Error fetching elobbies:', error)); // Catch and log any errors
  }, []);

  const handleEnterPress = (event) => {
    if (event.key === 'Enter') {
        handleSignUp();
    }
};
const handleSignUp = () => {
  // Validate that all fields are entered
  if (!username || !nickname || !password) {
    setError('Por favor, completa todos los campos.');
    return;
  }

  // Create an object with the new user data
  const newUser = {
    username,
    password,
    nickname,
    elobby
  };
  console.log(newUser);

  // Perform a POST request to the server to register the new user
  fetch('/api/usuarios/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: cipher(JSON.stringify(newUser), 1)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to register user');
    }
    // Redirect the user to the main page after successful registration
    window.location.href = `/principal/${username}`;
  })
  .catch(error => {
    console.error('Error registering user:', error);
    // Show an error message in case of registration failure
    setError('Error al registrar usuario. Por favor, intenta nuevamente.');
  });
};

// Example of the cipher function
function cipher(msg, key) {
  if (msg === undefined) {
    msg = "closed";
  }
  if (key === undefined) {
    key = 0;
  }

  let result = "";
  for (let i = 0; i < msg.length; i++) {
    let chara = String.fromCharCode(msg.charCodeAt(i) + key);
    result += chara;
  }

  return result;
}

  return (
    <div className="SignUp">
      <div className="form">
        <h1 className="saludo">Hola!</h1>
        <p className="instruccion">Ingresa tus datos para registrarse</p>
        <input
          type="text"
          className="input"
          placeholder="Nombre de usuario"
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
          onKeyPress={handleEnterPress}
        />
        {error && <p className="error">{error}</p>}
        <input
          type="button"
          className="ingresarBtn"
          value="Registrarse"
          onClick={handleSignUp}
          onKeyPress={handleEnterPress}
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
