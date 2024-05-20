import React, { useState } from 'react';
import data from './data/data.json'; // Importa el archivo JSON
import Logo from './assets/Logo.png';
import './styles/SignUp.scss';

function SignUp() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = () => {
    // Verifica si el usuario ya está registrado
    const existingUser = data.users.find(user => user.username === username);
    if (existingUser) {
      setError('El usuario ya está registrado');
      return;
    }

    // Crea un nuevo usuario y lo agrega al archivo JSON
    const newUser = {
      id: data.users.length + 1,
      username,
      nickname,
      password
    };
    data.users.push(newUser);

    // Actualiza el archivo JSON (en este caso, simplemente se imprime en la consola)
    console.log(data);

    // Redirige al usuario a la página principal después del registro exitoso
    window.location.href = '/principal';

    // Limpia los campos de entrada después del registro exitoso
    setUsername('');
    setNickname('');
    setPassword('');
    setError('');
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
