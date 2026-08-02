import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import logoIcon from '../img/logo-icon.png';

const GoogleIcon = () => (
  <svg className="w-1rem h-1rem mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login State
  const [username, setUsername] = useState('mixto@espe.edu.ec');
  const [password, setPassword] = useState('password123');

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regMiddleName, setRegMiddleName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regNationality, setRegNationality] = useState('Ecuatoriana');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    } else {
      if (res.user.roles.length > 1) {
        navigate('/select-role');
      } else {
        navigate(res.user.roles[0] === 'admin' ? '/admin' : '/');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regFirstName || !regLastName || !regDni || !regEmail || !regPhone || !regAddress || !regNationality) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setLoading(true);
    const res = await register({
      firstName: regFirstName,
      middleName: regMiddleName,
      lastName: regLastName,
      dni: regDni,
      email: regEmail,
      phone: regPhone,
      address: regAddress,
      nationality: regNationality,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.message);
      return;
    }
    setUsername('');
    setPassword('');
    setSuccessMsg('Tu cuenta fue creada. Revisa tu correo: te enviamos tu usuario y contraseña de primer acceso.');
    setIsLogin(true);
  };

  const features = [
    { icon: 'pi pi-bolt', text: 'Compra tus entradas en segundos' },
    { icon: 'pi pi-map', text: 'Elige tu asiento en el mapa del estadio' },
    { icon: 'pi pi-shield', text: 'Pagos seguros y confirmación al instante' },
  ];

  return (
    <div className="w-full min-h-screen flex">
      {/* Panel de marca (solo escritorio) */}
      <div className="hidden lg:flex lg:w-6 xl:w-5 animated-lines-bg flex-column justify-content-between p-6">
        <Link to="/" className="flex align-items-center gap-2" style={{ textDecoration: 'none' }}>
          <img src={logoIcon} alt="TickGo" style={{ height: '34px', width: 'auto' }} />
          <span className="text-2xl font-bold" style={{ color: '#f5f7f5' }}>
            Tick<span style={{ color: 'var(--tg-green)' }}>Go</span>
          </span>
        </Link>

        <div>
          <h2 className="text-5xl font-bold mb-3" style={{ color: '#f5f7f5', lineHeight: 1.1 }}>
            Tu pasión,<br />tu lugar.
          </h2>
          <p className="text-lg mb-6" style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '26rem' }}>
            Consigue tus entradas para los partidos más esperados sin filas ni complicaciones.
          </p>

          <div className="flex flex-column gap-3">
            {features.map((f) => (
              <div key={f.text} className="flex align-items-center gap-3">
                <div className="flex align-items-center justify-content-center border-round-lg flex-shrink-0" style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(106,197,47,0.14)' }}>
                  <i className={f.icon} style={{ color: 'var(--tg-green)' }}></i>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} TickGo</span>
      </div>

      {/* Panel del formulario */}
      <div className="flex-1 flex align-items-center justify-content-center p-4 surface-ground">
      {/* 3D Flip Container */}
      <div className="relative w-full max-w-26rem" style={{ perspective: '1000px', height: '650px' }}>
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isLogin ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          {/* Front: Login Form */}
          <div
            className="absolute top-0 left-0 w-full h-full solid-bg-white p-5 md:p-6 shadow-8 border-round-3xl flex flex-column justify-content-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center mb-5">
              <div className="w-4rem h-4rem surface-ground border-round-2xl flex align-items-center justify-content-center mx-auto mb-4 border-1 surface-border shadow-2">
                <i className="pi pi-ticket text-primary text-4xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-color mb-2">Bienvenido</h1>
              <p className="text-color-secondary">Ingresa a tu cuenta para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-column gap-4 flex-1">
              {error && <Message severity="error" text={error} />}
              {successMsg && <Message severity="success" text={successMsg} />}

              <div className="flex flex-column gap-2">
                <label htmlFor="email" className="font-medium text-color-secondary">Correo Electrónico</label>
                <IconField iconPosition="left" className="w-full">
                  <InputIcon className="pi pi-user" />
                  <InputText id="email" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full" placeholder="Ej. mixto@espe.edu.ec" />
                </IconField>
              </div>

              <div className="flex flex-column gap-2">
                <label htmlFor="password" className="font-medium text-color-secondary">Contraseña</label>
                <IconField iconPosition="left" className="w-full">
                  <InputIcon className="pi pi-lock" />
                  <Password 
                    inputId="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    feedback={false} 
                    toggleMask
                    className="w-full"
                    inputClassName="w-full pl-5"
                    style={{ width: '100%' }}
                    inputStyle={{ width: '100%' }}
                    placeholder="••••••••" 
                  />
                </IconField>
              </div>

              <Button label={loading ? 'Ingresando...' : 'Ingresar al Sistema'} type="submit" disabled={loading} className="w-full p-button-primary mt-2 shadow-2" />

              <div className="flex align-items-center justify-content-center my-3 text-color-secondary text-sm">
                <hr className="flex-grow-1 border-top-1 surface-border" />
                <span className="px-3">o continua con</span>
                <hr className="flex-grow-1 border-top-1 surface-border" />
              </div>

              <Button type="button" className="w-full p-button-outlined p-button-secondary flex align-items-center justify-content-center">
                <GoogleIcon /> Google
              </Button>
            </form>

            <p className="mt-5 text-center text-color-secondary">
              ¿No tienes una cuenta?{' '}
              <span onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }} className="text-primary cursor-pointer hover:underline font-medium">
                Regístrate aquí
              </span>
            </p>
          </div>

          {/* Back: Register Form */}
          <div 
            className="absolute top-0 left-0 w-full h-full solid-bg-white p-5 md:p-6 shadow-8 border-round-3xl flex flex-column justify-content-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-center mb-5">
              <div className="w-4rem h-4rem bg-primary border-round-2xl flex align-items-center justify-content-center mx-auto mb-4 shadow-3">
                <i className="pi pi-user text-primary-reverse text-4xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-color mb-2">Crea una cuenta</h1>
              <p className="text-color-secondary">Únete para reservar tus entradas</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-column gap-3 flex-1">
              {error && <Message severity="error" text={error} />}
              
              <div className="grid formgrid">
                <div className="field col-4">
                  <label className="text-sm font-medium text-color-secondary">Primer Nombre</label>
                  <InputText value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} className="w-full p-inputtext-sm" placeholder="Juan" />
                </div>
                <div className="field col-4">
                  <label className="text-sm font-medium text-color-secondary">Segundo Nombre</label>
                  <InputText value={regMiddleName} onChange={(e) => setRegMiddleName(e.target.value)} className="w-full p-inputtext-sm" placeholder="Carlos" />
                </div>
                <div className="field col-4">
                  <label className="text-sm font-medium text-color-secondary">Apellidos</label>
                  <InputText value={regLastName} onChange={(e) => setRegLastName(e.target.value)} className="w-full p-inputtext-sm" placeholder="Pérez" />
                </div>
              </div>

              <div className="flex flex-column gap-2">
                <label className="text-sm font-medium text-color-secondary">Correo Electrónico</label>
                <IconField iconPosition="left" className="w-full">
                  <InputIcon className="pi pi-envelope" />
                  <InputText type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full p-inputtext-sm" placeholder="juan@ejemplo.com" />
                </IconField>
              </div>

              <div className="grid formgrid">
                <div className="field col-6">
                  <label className="text-sm font-medium text-color-secondary">Cédula</label>
                  <InputText value={regDni} onChange={(e) => setRegDni(e.target.value)} className="w-full p-inputtext-sm" placeholder="1000000000" />
                </div>
                <div className="field col-6">
                  <label className="text-sm font-medium text-color-secondary">Celular</label>
                  <InputText value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full p-inputtext-sm" placeholder="0991234567" />
                </div>
              </div>

              <div className="grid formgrid">
                <div className="field col-6">
                  <label className="text-sm font-medium text-color-secondary">Dirección</label>
                  <InputText value={regAddress} onChange={(e) => setRegAddress(e.target.value)} className="w-full p-inputtext-sm" placeholder="Av. Siempre Viva 123" />
                </div>
                <div className="field col-6">
                  <label className="text-sm font-medium text-color-secondary">Nacionalidad</label>
                  <InputText value={regNationality} onChange={(e) => setRegNationality(e.target.value)} className="w-full p-inputtext-sm" placeholder="Ecuatoriana" />
                </div>
              </div>

              <Message
                severity="info"
                text="Al registrarte te enviaremos tu usuario y contraseña de primer acceso a este correo."
                className="w-full"
              />

              <Button label={loading ? 'Registrando...' : 'Registrarse'} type="submit" disabled={loading} className="w-full mt-2 shadow-2" />
            </form>

            <p className="mt-4 text-center text-color-secondary">
              ¿Ya tienes una cuenta?{' '}
              <span onClick={() => { setIsLogin(true); setError(''); }} className="text-primary cursor-pointer hover:underline font-medium">
                Inicia sesión
              </span>
            </p>
          </div>

        </motion.div>
      </div>
      </div>
    </div>
  );
}
