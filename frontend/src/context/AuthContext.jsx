import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    // Initial loading state depends on whether we have a token to verify
    const [loading, setLoading] = useState(!!localStorage.getItem("token"));

    const api = axios.create({
        baseURL: "/api",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    });

    api.interceptors.request.use((config) => {
        const t = localStorage.getItem('token');
        if (t) {
            config.headers.Authorization = `Bearer ${t}`;
        }
        return config;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            if (!user) {
                // We have a token but no user, so we are loading
                setLoading(true);
                api.get("/user", {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).then((res) => {
                    setUser(res.data);
                }).catch((error) => {
                    console.error("Auth Check Failed:", error);
                    setToken(null);
                    localStorage.removeItem("token");
                }).finally(() => {
                    setLoading(false);
                });
            } else {
                // User already loaded
                setLoading(false);
            }
        } else {
            localStorage.removeItem("token");
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await api.post("/login", { email, password });
            setToken(res.data.access_token);
            setUser(res.data.user);
            return res.data.user;
        } catch (error) {
            setDebugError(error.response ? error.response.data.message : error.message);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, api, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
