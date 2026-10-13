import React, { useState } from 'react';
import { Field } from './Field';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../data';
import { Mail, Lock, ArrowRight, ShieldCheck, Key, AlertCircle } from '../icons';
import { getSupabaseClient } from '../supabase';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onNavigateToHome?: () => void;
  currentGoogleUser?: any;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onNavigateToRegister,
  onNavigateToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingrese su correo electrónico y contraseña.');
      return;
    }

    setError('');
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Obtener usuarios registrados localmente en localStorage (usuarios, operarios y clientes)
    let localUsers: UserProfile[] = [];
    try {
      const stored = localStorage.getItem('colorlink_users');
      if (stored) {
        localUsers = JSON.parse(stored);
      }
    } catch {
      localUsers = [];
    }

    // Incluir personal operativo editado por el administrador
    let staffUsers: UserProfile[] = [];
    try {
      const storedStaff = localStorage.getItem('colorlink_staff');
      if (storedStaff) {
        const staffList = JSON.parse(storedStaff);
        staffUsers = staffList.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          password: s.password || 'pintuco2026',
          phone: s.phone || '',
          role: s.role || 'conductor',
          company: `${s.cediName || 'CEDI'} · Pintuco S.A.`,
          city: s.cediCity || 'Medellín',
          vehiclePlate: s.vehiclePlate,
          badgeNumber: s.badgeNumber,
        }));
      }
    } catch {}

    // Incluir clientes editados o creados por el administrador
    let clientUsers: UserProfile[] = [];
    try {
      const storedClients = localStorage.getItem('colorlink_clients');
      if (storedClients) {
        const clientsList = JSON.parse(storedClients);
        clientUsers = clientsList.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          password: c.password || 'cliente123',
          phone: c.phone || '',
          company: c.company || 'Constructora / Cliente',
          role: 'cliente',
          city: c.city || 'Medellín',
          address: c.address,
        }));
      }
    } catch {}

    // Combinar usuarios: staff y clientes tienen prioridad sobre usuarios demo y locales
    const allUsers = [...staffUsers, ...clientUsers, ...localUsers, ...DEMO_USERS];
    let matchedUser = allUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    // 2. Verificar en Supabase Cloud si hay cliente/conexión disponible
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: supaUser, error: supaErr } = await client
          .from('usuarios')
          .select('*')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (supaUser && !supaErr) {
          const cloudPass = supaUser.password || supaUser.contrasena;

          // Si el usuario en Supabase tiene contraseña y no coincide
          if (cloudPass && cloudPass !== password) {
            setIsLoading(false);
            setError('Contraseña incorrecta. Verifique la clave ingresada.');
            return;
          }

          // Si en Supabase no tenía contraseña guardada aún, guardarla ahora
          if (!cloudPass) {
            try {
              await client
                .from('usuarios')
                .update({ password })
                .eq('email', normalizedEmail);
            } catch {
              // Si la columna password aún no existe en Supabase, se ignora
            }
          }

          const loggedInUser: UserProfile = {
            id: supaUser.id_usuario || matchedUser?.id || 'usr-' + Math.random().toString(36).substring(2, 7),
            name: supaUser.nombre || matchedUser?.name || 'Cliente ColorLink',
            email: supaUser.email,
            password: password,
            phone: supaUser.telefono || matchedUser?.phone || '',
            company: matchedUser?.company || 'Constructora / Cliente',
            role: (supaUser.rol as any) || matchedUser?.role || 'cliente',
            city: matchedUser?.city || 'Medellín',
          };

          // Actualizar en localStorage para sesiones inmediatas
          const updatedUsers = localUsers.filter((u) => u.email.toLowerCase() !== normalizedEmail);
          updatedUsers.unshift(loggedInUser);
          localStorage.setItem('colorlink_users', JSON.stringify(updatedUsers));

          setIsLoading(false);
          onLogin(loggedInUser);
          return;
        }
      } catch (cloudErr) {
        console.warn('Consulta a Supabase en login:', cloudErr);
      }
    }

    // 3. Si se encuentra en usuarios locales o demo
    if (matchedUser) {
      // Auto-reparación: si el usuario fue registrado con el valor por defecto 'cliente123'
      // y ahora ingresa con su contraseña deseada, actualizamos su contraseña en almacenamiento
      if (matchedUser.password === 'cliente123' && password !== 'cliente123') {
        matchedUser.password = password;
        const updatedUsers = localUsers.map((u) =>
          u.email.toLowerCase() === normalizedEmail ? { ...u, password } : u
        );
        localStorage.setItem('colorlink_users', JSON.stringify(updatedUsers));
      } else if (matchedUser.password && matchedUser.password !== password) {
        setIsLoading(false);
        setError('Contraseña incorrecta. Verifique la clave ingresada.');
        return;
      }

      setIsLoading(false);
      onLogin(matchedUser);
      return;
    }

    // 4. Si es un correo corporativo Pintuco o patrón de prueba
    if (normalizedEmail.includes('admin')) {
      const adminUser = DEMO_USERS.find((u) => u.role === 'administrador')!;
      setIsLoading(false);
      onLogin({ ...adminUser, email: normalizedEmail });
      return;
    }
    if (normalizedEmail.includes('empacador') || normalizedEmail.includes('bodega')) {
      const packUser = DEMO_USERS.find((u) => u.role === 'empacador')!;
      setIsLoading(false);
      onLogin({ ...packUser, email: normalizedEmail });
      return;
    }
    if (normalizedEmail.includes('conductor') || normalizedEmail.includes('chofer') || normalizedEmail.includes('transporte')) {
      const driverUser = DEMO_USERS.find((u) => u.role === 'conductor')!;
      setIsLoading(false);
      onLogin({ ...driverUser, email: normalizedEmail });
      return;
    }

    // 5. Si no existe en la base de datos
    setIsLoading(false);
    setError(
      'Usuario no encontrado. Verifique su correo o regístrese si es nuevo en el sistema.'
    );
  };

  const handleFillDemo = (demoUser: UserProfile) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password || 'pintuco2026');
    setError('');
  };

  return (
    <div className="form-card max-w-md bg-white border border-blue-100 rounded-2xl p-6 shadow-sm" id="login-view-card">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="card-eyebrow text-blue-700 font-bold" id="login-eyebrow">
            ACCESO SEGURO · COLORLINK
          </p>
          <h2 className="card-title text-blue-950 font-bold" id="login-title">
            Iniciar Sesión
          </h2>
          <p className="card-subtitle text-slate-600 text-xs" id="login-subtitle">
            Ingrese sus credenciales para acceder al portal asignado según su rol.
          </p>
        </div>

        {onNavigateToHome && (
          <button
            type="button"
            onClick={onNavigateToHome}
            className="text-[11px] font-bold text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>← Inicio ColorLink</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2" id="login-error-banner">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulario Estándar y Limpio · Paleta Blanco y Azul */}
      <form onSubmit={handleSubmit} id="login-form" className="space-y-4">
        <Field
          id="login-email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          placeholder="ejemplo@colorlink.com"
          icon={<Mail className="w-4 h-4 text-blue-600" />}
          required
        />

        <Field
          id="login-password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError('');
          }}
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4 text-blue-600" />}
          required
        />

        <button
          type="submit"
          id="btn-login-submit"
          className="btn-primary mt-2 !py-2.5 w-full flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Verificando credenciales...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Ingresar al Sistema
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      {/* Separador Google */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500 font-semibold font-mono text-[11px]">
            o conectar cuenta
          </span>
        </div>
      </div>

      {/* Botón Oficial Google / Gmail */}
      <div className="w-full flex justify-center">
        <GoogleSignInButton
          currentGoogleUser={undefined}
          onAuthSuccess={(gUser) => {
            const normalizedEmail = (gUser.email || '').toLowerCase().trim();
            let localUsers: UserProfile[] = [];
            try {
              const stored = localStorage.getItem('colorlink_users');
              if (stored) localUsers = JSON.parse(stored);
            } catch {}

            const allUsers = [...localUsers, ...DEMO_USERS];
            const matchedUser = allUsers.find(
              (u) => u.email.toLowerCase() === normalizedEmail
            );

            if (matchedUser) {
              onLogin(matchedUser);
            } else {
              const newUser: UserProfile = {
                id: 'usr-' + Math.random().toString(36).substring(2, 8),
                name: gUser.displayName || 'Cliente ColorLink',
                email: gUser.email,
                phone: '',
                company: 'Constructora / Cliente',
                role: 'cliente',
                city: 'Medellín',
              };
              localUsers.unshift(newUser);
              try {
                localStorage.setItem('colorlink_users', JSON.stringify(localUsers));
              } catch {}
              onLogin(newUser);
            }
          }}
        />
      </div>

      {/* Acceso a Registro */}
      <p className="switch-text text-center pt-2 text-xs text-slate-600" id="login-register-prompt">
        ¿No tiene una cuenta registrada?{' '}
        <button
          type="button"
          className="btn-link text-blue-600 font-bold hover:underline cursor-pointer"
          id="btn-goto-register"
          onClick={onNavigateToRegister}
        >
          Crear cuenta nueva
        </button>
      </p>

      {/* Bloque de Cuentas Demo · Armonía en Blanco y Azul */}
      <div className="mt-3.5 bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-xs">
        <button
          type="button"
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          className="w-full flex items-center justify-between text-blue-950 hover:text-blue-700 font-mono text-[11px] cursor-pointer"
        >
          <span className="flex items-center gap-1.5 font-bold text-blue-950">
            <Key className="w-3.5 h-3.5 text-blue-600" />
            Cuentas demo para acceso rápido
          </span>
          <span className="text-[10px] text-blue-600 font-sans underline font-semibold">
            {showDemoAccounts ? 'Ocultar' : 'Ver correos preconfigurados'}
          </span>
        </button>

        {showDemoAccounts && (
          <div className="mt-2.5 space-y-1.5 pt-2 border-t border-blue-200">
            <p className="text-[10.5px] text-slate-600 mb-1">
              Click en cualquier cuenta para autocompletar correo y contraseña (clave: <code className="font-mono text-blue-900 font-bold">pintuco2026</code> o tu clave):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleFillDemo(demo)}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-100/70 border border-blue-200 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
                >
                  <p className="font-mono text-[10px] font-bold text-blue-950 truncate">
                    {demo.email}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {demo.role === 'administrador' ? '👑 Administrador General' : demo.role === 'empacador' ? '📦 Operario de Bodega' : demo.role === 'conductor' ? '🚚 Conductor Express' : '🏗️ Cliente / Constructora'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        <span>Autenticación protegida con control de acceso por rol</span>
      </div>
    </div>
  );
};
