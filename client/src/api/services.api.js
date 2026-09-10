import api from './client';

// Services, Packages & Addons Management
export const getServices = (vehicleType) => api.get('/services', { params: { vehicleType } });
export const getPackages = (vehicleType) => api.get('/services/packages', { params: { vehicleType } });
export const getAddons = () => api.get('/services/addons');
export const createService = (serviceData) => api.post('/services', serviceData);
export const updateService = (id, serviceData) => api.put(`/services/${id}`, serviceData);
export const deleteService = (id) => api.delete(`/services/${id}`);
export const uploadServiceImage = (imageData) => api.post('/services/upload', { image: imageData });

export const createPackage = (pkgData) => api.post('/services/packages', pkgData);
export const updatePackage = (id, pkgData) => api.put(`/services/packages/${id}`, pkgData);
export const deletePackage = (id) => api.delete(`/services/packages/${id}`);
