import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import axios from 'axios';
import api from '../api/api';

interface VerifyUser {
    name?: string;
}

interface VerifiedUserData {
    name?: string;
    selfie?: string;
}

interface VerifyIdentityProps {
    user?: VerifyUser;
    onVerified: (userData: VerifiedUserData) => void;
}

const VerifyIdentity: React.FC<VerifyIdentityProps> = ({ user, onVerified }) => {
    const [mode, setMode] = useState<'CHOOSING' | 'CAMERA' | 'UPLOAD'>('CHOOSING');
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const webcamRef = useRef<Webcam>(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState(false);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    const handleCameraError = (err: string | DOMException) => {
        console.error("Camera Error:", err);
        setCameraError(true);
        setError("No se pudo acceder a la cámara. Asegúrate de dar permisos en el navegador.");
    };

    const capture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
            setMode('CHOOSING');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setMode('CHOOSING');
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        
        try {
            const data = new FormData();
            if (file) {
                data.append('selfie', file);
            } else if (image) {
                const res = await fetch(image);
                const blob = await res.blob();
                data.append('selfie', blob, 'selfie.jpg');
            }

            const response = await api.post('/auth/verify-identity', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onVerified(response.data);
        } catch (err: unknown) {
            if (axios.isAxiosError<string>(err)) {
                setError(err.response?.data || 'Error en la verificación');
            } else {
                setError('Error en la verificación');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 p-8 text-white text-center">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold">Verificación de Identidad</h1>
                    <p className="text-blue-100 mt-2">Hola {user?.name}, activa tu cuenta ahora</p>
                </div>

                <div className="p-10">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex gap-4 items-start">
                        <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                        <div>
                            <h3 className="font-bold text-blue-900">¿Por qué es necesario?</h3>
                            <p className="text-blue-700 text-sm mt-1">
                                Debemos verificar que tu rostro coincide con tu DNI.
                            </p>
                        </div>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>}

                    {mode === 'CHOOSING' && !image && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <button
                                onClick={() => { setMode('CAMERA'); setCameraError(false); setCameraReady(false); }}
                                className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 hover:bg-slate-50 transition-all group"
                            >
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Camera className="w-8 h-8" />
                                </div>
                                <span className="font-bold text-slate-700">Usar Cámara</span>
                            </button>

                            <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer group">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <span className="font-bold text-slate-700">Subir Archivo</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        </div>
                    )}

                    {mode === 'CAMERA' && (
                        <div className="flex flex-col items-center">
                            <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black mb-6 relative">
                                {!cameraReady && !cameraError && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white gap-3">
                                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Iniciando cámara...</span>
                                    </div>
                                )}
                                {cameraError && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                                        <Camera className="w-12 h-12 text-slate-500 mb-4" />
                                        <p className="text-slate-400">Error al acceder a la cámara</p>
                                    </div>
                                )}
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={videoConstraints}
                                    onUserMedia={() => setCameraReady(true)}
                                    onUserMediaError={handleCameraError}
                                    className={`w-full h-full object-cover ${cameraReady ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                                />
                            </div>
                            <div className="flex gap-4 w-full">
                                <button onClick={() => setMode('CHOOSING')} className="flex-1 py-4 border border-slate-200 rounded-xl font-bold text-slate-600">Cancelar</button>
                                <button 
                                    onClick={capture} 
                                    disabled={!cameraReady}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Tomar Foto
                                </button>
                            </div>
                        </div>
                    )}

                    {image && (
                        <div className="flex flex-col items-center">
                            <img src={image} alt="Selfie" className="w-64 h-64 object-cover rounded-full border-4 border-blue-600 mb-6 shadow-xl" />
                            <div className="flex gap-4 w-full">
                                <button onClick={() => { setImage(null); setFile(null); }} className="flex-1 py-4 border border-slate-200 rounded-xl font-bold text-slate-600">Repetir</button>
                                <button onClick={handleSubmit} disabled={loading} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? 'Subiendo...' : 'Confirmar Verificación'} <CheckCircle className="w-5 h-5 ml-2" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyIdentity;
