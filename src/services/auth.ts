import api from "./api";

type LoginResponse = {
  token: string;
};

// Endpoints configurados para tu backend Django
const LOGIN_PATH = "/api/token/"; // obtiene el token de autenticación
const REGISTER_COMPANY_PATH = "/api/empresas/"; // endpoint para registro de empresas

// Tipo para el registro de empresa
type CompanyRegistration = {
  companyName: string;
  nit: string;
  email: string;
  password: string;
};

export const login = async (username: string, password: string) => {
  try {
    console.log('🔄 Intentando login con:', { username });
    const resp = await api.post<LoginResponse>(LOGIN_PATH, { username, password });
    console.log('✅ Respuesta del login:', resp.data);
    
    const { token } = resp.data;
    localStorage.setItem("access_token", token);
    
    return resp.data;
  } catch (error: any) {
    console.error('❌ Error en login:', error.response?.data || error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("access_token");
};

// Función interna para obtener el token de admin
const getAdminToken = async () => {
  try {
    // 1. Intentar obtener el token guardado
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      console.log('📝 Usando token guardado');
      return savedToken;
    }

    // 2. Si no hay token, obtener uno nuevo
    const { ADMIN_CREDENTIALS } = await import('../config/auth.config');
    console.log('🔑 Obteniendo nuevo token para:', ADMIN_CREDENTIALS.email);
    
    const response = await api.post<LoginResponse>(LOGIN_PATH, {
      username: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password
    });
    
    if (!response.data.token) {
      throw new Error('No se recibió token de acceso');
    }

    console.log('✅ Token obtenido exitosamente');
    
    // 3. Guardar el token
    localStorage.setItem('access_token', response.data.token);
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Error al obtener token:', error);
    // Limpiar token en caso de error
    localStorage.removeItem('access_token');
    throw error;
  }
};

// Función para usar en las peticiones que requieren auth
export const getAuthHeaders = async () => {
  const adminToken = await getAdminToken();
  console.log('🔑 Token a usar:', adminToken);
  return {
    'Authorization': `Token ${adminToken}`,
    'Content-Type': 'application/json'
  };
};

export const registerCompany = async (companyData: CompanyRegistration) => {
  try {
    // Obtener headers con el token de admin
    const headers = await getAuthHeaders();
    
    // Registrar la empresa usando el token de admin
    await api.post(REGISTER_COMPANY_PATH, companyData, { headers });
    
    // Si el registro fue exitoso, hacer login con la nueva cuenta
    return await login(companyData.email, companyData.password);
  } catch (error: any) {
    console.error('Error en el proceso de registro:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  // Ajusta la ruta si usas un endpoint distinto para obtener el usuario
  return api.get("auth/me/");
};

export default {
  login,
  logout,
  registerCompany,
  getCurrentUser,
};
