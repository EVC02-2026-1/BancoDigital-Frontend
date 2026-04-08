import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyIdentity from './pages/VerifyIdentity';
import Transfers from './pages/Transfers';
import Movements from './pages/Movements';

type View = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'VERIFY' | 'DASHBOARD' | 'TRANSFERS' | 'MOVEMENTS' | 'RESET_PASSWORD';

interface AppUser {
    name?: string;
    email?: string;
    verified?: boolean;
    selfie?: string;
}

interface InitialAppState {
    view: View;
    currentUser?: AppUser;
    resetToken: string;
}

const AUTH_USER_KEY = 'currentUser';

const getStoredToken = (): string | null => localStorage.getItem('token') || sessionStorage.getItem('token');

const getStoredUser = (): AppUser | undefined => {
    const rawUser = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);

    if (!rawUser) {
        return undefined;
    }

    try {
        return JSON.parse(rawUser) as AppUser;
    } catch {
        localStorage.removeItem(AUTH_USER_KEY);
        sessionStorage.removeItem(AUTH_USER_KEY);
        return undefined;
    }
};

const saveUserSession = (userData: AppUser): void => {
    const targetStorage = localStorage.getItem('token') ? localStorage : sessionStorage;
    targetStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
};

const clearSession = (): void => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
};

const getInitialAppState = (): InitialAppState => {
    const path = window.location.pathname;

    if (path.startsWith('/reset-password/')) {
        const token = path.split('/reset-password/')[1];

        if (token) {
            return {
                view: 'RESET_PASSWORD',
                resetToken: token,
            };
        }
    }

    if (!getStoredToken()) {
        return {
            view: 'LOGIN',
            resetToken: '',
        };
    }

    const storedUser = getStoredUser();

    return {
        view: storedUser?.verified === false ? 'VERIFY' : 'DASHBOARD',
        currentUser: storedUser,
        resetToken: '',
    };
};

const App = (): React.ReactElement => {
    const [initialState] = useState<InitialAppState>(() => getInitialAppState());
    const [view, setView] = useState<View>(initialState.view);
    const [currentUser, setCurrentUser] = useState<AppUser | undefined>(initialState.currentUser);
    const [resetToken] = useState<string>(initialState.resetToken);

    const handleLoginSuccess = (userData: AppUser) => {
        saveUserSession(userData);
        setCurrentUser(userData);
        if (!userData.verified) {
            setView('VERIFY');
        } else {
            setView('DASHBOARD');
        }
    };

    const handleRegisterSuccess = (userData: AppUser) => {
        saveUserSession(userData);
        setCurrentUser(userData);
        setView('VERIFY'); // Always verify after registration as per "blocking" request
    };

    const handleVerified = (updatedUser: AppUser) => {
        saveUserSession(updatedUser);
        setCurrentUser(updatedUser);
        setView('DASHBOARD');
    };

    const handleLogout = () => {
        clearSession();
        setCurrentUser(undefined);
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
