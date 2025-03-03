// src/services/userService.js oluşturabilirsiniz (varsa bu adımı atlayın)
import apiClient from './apiClient';

const UserService = {
  updateProfile: (firstName, lastName, phone) => {
    return apiClient.put('/users/me', { firstName, lastName, phone });
  },
  
  changePassword: (currentPassword, newPassword) => {
    return apiClient.put('/users/me/password', { 
      currentPassword, 
      newPassword 
    });
  },
};

export default UserService;