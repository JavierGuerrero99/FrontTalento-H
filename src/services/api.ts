// Editar vacante
export const editVacancy = async (id: number, payload: any) => {
  const host = BASE_URL.replace(/\/api\/?$/i, "");
  const url = `${host}/vacantes/${id}/editar/`;
  return api.put(url, payload);
};

// Eliminar vacante
export const deleteVacancy = async (id: number) => {
  const host = BASE_URL.replace(/\/api\/?$/i, "");
  const url = `${host}/vacantes/${id}/eliminar/`;
  return api.delete(url);
};

// Publicar vacante
export const publishVacancy = async (id: number) => {
  const host = BASE_URL.replace(/\/api\/?$/i, "");
  const url = `${host}/vacantes/${id}/publicar/`;
  return api.patch(url);
};

// Listar vacantes (sin prefijo /api en la URL; acepta empresa_id opcional)
export const listVacancies = async (empresa_id?: number) => {
  const host = BASE_URL.replace(/\/api\/?$/i, "");
  let url = `${host}/vacantes/`;
  if (empresa_id) {
    url += `?empresa_id=${empresa_id}`;
  }
  const resp = await api.get(url);
  return resp.data;
};

// Obtener una vacante por id (sin prefijo /api)
export const getVacancy = async (id: number) => {
  const host = BASE_URL.replace(/\/api\/?$/i, "");
  const url = `${host}/vacantes/${id}/`;
  const resp = await api.get(url);
  return resp.data;
};
import axios, { AxiosError } from "axios";

// Base URL desde Vite env (VITE_API_BASE_URL). Si no existe, usa localhost por defecto.
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper para obtener el token de acceso desde localStorage (el que se usa en Authorization)
const getAccessToken = () => localStorage.getItem("access_token");

// Attach token a cada request si existe
api.interceptors.request.use((config) => {
  // No añadir token para login/refresh
  if (config.url?.includes('/token/')) {
    return config;
  }

  const token = getAccessToken();
  if (token && config.headers) {
    // Usamos Bearer para JWTs devueltos por SimpleJWT (access)
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔒 Enviando request autenticado:', {
      url: config.url,
      method: config.method,
      tokenStart: token.substring(0, 10) + '...'
    });
  } else {
    console.log('⚠️ Request sin token:', {
      url: config.url,
      method: config.method
    });
  }
  return config;
});

// Interceptor simple para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Intentamos refrescar el token si recibimos un 401
      if (error.response?.status === 401) {
        console.warn('🚨 401 recibido en:', error.config?.url, '; headers usados:', error.config?.headers);
        const originalRequest = error.config as any;
        // Evitar loops infinitos
        if (!originalRequest?._retry) {
          originalRequest._retry = true;
          try {
            const newAccess = await refreshAccessToken();
            if (newAccess) {
              // Reintentar la petición original con el nuevo token
              originalRequest.headers.Authorization = `Bearer ${newAccess}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ Error al refrescar token:', refreshError);
            // si falla refrescar, limpiamos tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
        // Si ya intentamos refrescar o no hay refresh token, eliminar token
        localStorage.removeItem('access_token');
      }
    console.error('❌ Error en request:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Función para obtener las empresas del usuario
export const getUserCompanies = async () => {
  try {
    const response = await api.get("/empresas/");
    console.log('📦 Empresas recibidas:', response.status, response.data);
    return response.data; // Asumimos que el backend devuelve un array de empresas
  } catch (error) {
    const err = error as any;
    console.error("Error al obtener las empresas del usuario:", err.response?.status, err.response?.data || err);
    throw error;
  }
};

// Obtener una empresa por id
export const getCompanyById = async (id: number) => {
  try {
    const response = await api.get(`/empresas/${id}/`);
    return response.data;
  } catch (error) {
    const err = error as any;
    console.error(`Error al obtener empresa ${id}:`, err.response?.status, err.response?.data || err);
    throw error;
  }
};

// Actualizar una empresa (se soporta FormData para logo)
export const updateCompany = async (id: number, formData: FormData) => {
  try {
    const response = await api.patch(`/empresas/${id}/`, formData, {
      headers: {
        // Dejar que axios configure el boundary; indicamos multipart
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    const err = error as any;
    console.error(`Error al actualizar empresa ${id}:`, err.response?.status, err.response?.data || err);
    throw error;
  }
};

export default api;

// Convierte una URL relativa del backend a absoluta usando el host de la API
export const makeAbsoluteUrl = (path?: string | null) => {
  if (!path) return undefined;
  if (typeof path !== "string") return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  // Si la ruta ya incluye /api/ al inicio, remover la parte /api
  const host = BASE_URL.replace(/\/api\/?$/i, "");

  if (path.startsWith("/")) return `${host}${path}`;
  return `${host}/${path}`;
};

// Intenta refrescar el token usando el endpoint de refresh
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    console.warn('⚠️ No hay refresh_token disponible para refrescar');
    return null;
  }

  try {
    const resp = await api.post("/token/refresh/", { refresh: refreshToken });
    const { access } = resp.data || {};
    if (access) {
      localStorage.setItem('access_token', access);
      console.log('✅ Token refrescado con éxito');
      return access;
    }
    return null;
  } catch (err) {
    console.error('❌ Error en refresh token:', err);
    return null;
  }
};

// Obtener perfil del usuario autenticado (usa baseURL con /api)
export const getProfile = async () => {
  try {
    const resp = await api.get("/perfil/");
    return resp.data;
  } catch (error) {
    const err = error as any;
    console.error("Error al obtener el perfil:", err.response?.status, err.response?.data || err);
    throw error;
  }
};

// Actualizar datos de un usuario concreto (usa /api/users/{id}/)
export const updateProfile = async (id: number, payload: any) => {
  try {
    const resp = await api.put(`/users/${id}/`, payload);
    return resp.data;
  } catch (error) {
    const err = error as any;
    console.error("Error al actualizar el perfil:", err.response?.status, err.response?.data || err);
    throw error;
  }
};

// Crear una vacante (oferta de empleo)
export const createVacancy = async (payload: {
  titulo: string;
  descripcion: string;
  requisitos: string;
  fecha_expiracion: string; // ISO format YYYY-MM-DDTHH:MM:SS
  empresa_id: number;
}) => {
  try {
    // Algunas rutas para vacantes están fuera del prefijo /api; construir host base sin /api
    const host = BASE_URL.replace(/\/api\/?$/i, "");
    const url = `${host}/vacantes/crear/`;
    const response = await api.post(url, payload);
    console.log('✅ Vacante creada:', response.data);
    // El backend devuelve { message, vacante_id } en 201
    return {
      id: response.data.vacante_id,
      titulo: payload.titulo,
      descripcion: payload.descripcion,
      ...response.data
    };
  } catch (error) {
    const err = error as any;
    console.error('❌ Error creando vacante:', err.response?.status, err.response?.data || err);
    throw error;
  }
};
