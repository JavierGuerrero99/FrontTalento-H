import api from './api';
import { getAuthHeaders } from './auth';

export const testConnection = async () => {
  try {
    console.log('🔍 Iniciando prueba de conexión...');
    
    // 1. Limpiar tokens anteriores
    console.log('🧹 Limpiando tokens anteriores...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_access_token');
    
    // 2. Mostrar configuración
    const { ADMIN_CREDENTIALS } = await import('../config/auth.config');
    console.log('📝 Configuración:', {
      username: ADMIN_CREDENTIALS.email,
      password: '***' + ADMIN_CREDENTIALS.password.substring(ADMIN_CREDENTIALS.password.length - 2)
    });

    // 2. Intentar obtener token
    console.log('🔑 Enviando petición a /api/token/...');
    const loginResp = await api.post('/api/token/', {
      username: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Login exitoso:', loginResp.data);

    // 3. Intentar hacer una petición autenticada
    console.log('🔒 Probando petición autenticada...');
    const headers = await getAuthHeaders();
    const testResp = await api.get('/api/empresas/', { headers });
    console.log('✅ Petición autenticada exitosa:', testResp.data);

    return { 
      success: true, 
      message: 'Conexión exitosa con el backend',
      loginResponse: loginResp.data,
      testResponse: testResp.data
    };
  } catch (error: any) {
    console.error('❌ Error completo:', error);
    console.error('❌ Respuesta del servidor:', error.response?.data);
    console.error('❌ Estado HTTP:', error.response?.status);
    
    const errorDetail = error.response?.data?.detail || 
                       error.response?.data || 
                       error.message || 
                       'Error desconocido';

    return {
      success: false,
      message: 'Error de conexión',
      error: JSON.stringify(errorDetail, null, 2),
      status: error.response?.status,
      config: error.config
    };
  }
};