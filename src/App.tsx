import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyIdentity from './pages/VerifyIdentity';
import Transfers from './pages/Transfers';
import Movements from './pages/Movements';

type View = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'VERIFY' | 'DASHBOARD' | 'TRANSFERS' | 'MOVEMENTS' | 'RESET_PASSWORD';

const App = (): React.ReactElement => {
    const [view, setView] = useState<View>('LOGIN');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [resetToken, setResetToken] = useState<string>('');

    useEffect(() => {
        // Simple routing by reading the pathname without a React Router
        const path = window.location.pathname;
        if (path.startsWith('/reset-password/')) {
            const token = path.split('/reset-password/')[1];
            if (token) {
                setResetToken(token);
                setView('RESET_PASSWORD');
                return;
            }
        }

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            // Check session
        }
    }, []);

    // Lógica de Cierre de Sesión por Inactividad (15 minutos)
    useEffect(() => {
        if (!currentUser) return;

        const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos
        let timeoutId: any;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                handleLogout();
                alert('Su sesión ha expirado por inactividad por motivos de seguridad.');
            }, INACTIVITY_LIMIT);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        resetTimer();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [currentUser]);

    const handleLoginSuccess = (userData: any) => {
        setCurrentUser(userData);
        if (!userData.verified) {
            setView('VERIFY');
        } else {
            setView('DASHBOARD');
        }
    };

    const handleRegisterSuccess = (userData: any) => {
        setCurrentUser(userData);
        setView('VERIFY'); // Always verify after registration as per "blocking" request
    };

    const handleVerified = (updatedUser: any) => {
        setCurrentUser(updatedUser);
        setView('DASHBOARD');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setCurrentUser(null);
        setView('LOGIN');
    };

    return (
        <div className="antialiased text-slate-900">
            {view === 'LOGIN' && (
                <Login 
                    onLogin={handleLoginSuccess} 
                    onRegister={() => setView('REGISTER')} 
                    onForgot={() => setView('FORGOT')} 
                />
            )}
            {view === 'REGISTER' && (
                <Register 
                    onSuccess={handleRegisterSuccess} 
                    onBack={() => setView('LOGIN')} 
                />
            )}
            {view === 'FORGOT' && (
                <ForgotPassword onBack={() => setView('LOGIN')} />
            )}
            {view === 'RESET_PASSWORD' && (
                <ResetPassword token={resetToken} onBack={() => {
                    window.history.pushState({}, '', '/');
                    setView('LOGIN');
                }} />
            )}
            {view === 'VERIFY' && (
                <VerifyIdentity user={currentUser} onVerified={handleVerified} />
            )}
            {view === 'DASHBOARD' && (
                <Dashboard user={currentUser} onLogout={handleLogout} onNavigate={setView} />
            )}
            {view === 'TRANSFERS' && (
                <Transfers onBack={() => setView('DASHBOARD')} />
            )}
            {view === 'MOVEMENTS' && (
                <Movements onBack={() => setView('DASHBOARD')} />
            )}
        </div>
    );
};

export default App;
