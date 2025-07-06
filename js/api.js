// UR DOC - JSON Data Service
// Handles all data storage using JSON files (no backend required)

// JSON Data Service Class
class JSONDataService {
    constructor() {
        this.data = {
            users: [],
            consultations: [],
            prescriptions: [],
            notifications: []
        };
        this.initialized = false;
    }

    // Initialize data by loading JSON files
    async initialize() {
        if (this.initialized) return;
        
        try {
            // Load all JSON data files
            const [usersResponse, consultationsResponse, prescriptionsResponse, notificationsResponse] = await Promise.all([
                fetch('data/users.json'),
                fetch('data/consultations.json'),
                fetch('data/prescriptions.json'),
                fetch('data/notifications.json')
            ]);

            this.data.users = (await usersResponse.json()).users;
            this.data.consultations = (await consultationsResponse.json()).consultations;
            this.data.prescriptions = (await prescriptionsResponse.json()).prescriptions;
            this.data.notifications = (await notificationsResponse.json()).notifications;

            this.initialized = true;
            console.log('JSON data loaded successfully');
        } catch (error) {
            console.error('Failed to load JSON data:', error);
            // Fallback to empty data
            this.data = {
                users: [],
                consultations: [],
                prescriptions: [],
                notifications: []
            };
            this.initialized = true;
        }
    }

    // Set authentication token
    setToken(token) {
        localStorage.setItem('ur_doc_token', token);
    }

    // Get authentication token
    getToken() {
        return localStorage.getItem('ur_doc_token');
    }

    // Clear authentication token
    clearToken() {
        localStorage.removeItem('ur_doc_token');
    }

    // Get current user
    getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const userData = JSON.parse(token);
            return userData;
        } catch (error) {
            return null;
        }
    }

    // Health check
    async healthCheck() {
        await this.initialize();
        return {
            status: 'OK',
            message: 'UR DOC JSON Data Service is working',
            timestamp: new Date().toISOString(),
            environment: 'json-files',
            dataLoaded: this.initialized
        };
    }

    // Authentication APIs
    async register(userData) {
        await this.initialize();
        
        try {
            // Check if user already exists
            const existingUser = this.data.users.find(user => user.email === userData.email);
            if (existingUser) {
                throw new Error('A user with this email already exists');
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: userData.name,
                email: userData.email,
                password: userData.password, // In real app, this would be hashed
                role: userData.role,
                phone: userData.phone || null,
                specialization: userData.specialization || null,
                is_active: true,
                is_verified: false,
                profile_image: null,
                last_login: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            this.data.users.push(newUser);

            // Generate token
            const token = JSON.stringify({
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role
            });

            this.setToken(token);

            // Remove password from response
            const { password, ...userWithoutPassword } = newUser;

            return {
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userWithoutPassword,
                    token
                }
            };

        } catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    }

    async login(credentials) {
        await this.initialize();
        
        try {
            // Find user
            const user = this.data.users.find(u => u.email === credentials.email);
            if (!user) {
                throw new Error('Email or password is incorrect');
            }

            // Check password (simple comparison for demo)
            if (user.password !== credentials.password) {
                throw new Error('Email or password is incorrect');
            }

            // Check if user is active
            if (!user.is_active) {
                throw new Error('Your account has been disabled. Please contact support.');
            }

            // Update last login
            user.last_login = new Date().toISOString();

            // Generate token
            const token = JSON.stringify({
                userId: user.id,
                email: user.email,
                role: user.role
            });

            this.setToken(token);

            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            return {
                success: true,
                message: 'Login successful',
                data: {
                    user: userWithoutPassword,
                    token
                }
            };

        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    }

    async logout() {
        this.clearToken();
        return {
            success: true,
            message: 'Logout successful'
        };
    }

    // User APIs
    async getProfile() {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Not authenticated');
            }

            const user = this.data.users.find(u => u.id === currentUser.userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            const { password, ...userWithoutPassword } = user;

            return {
                success: true,
                data: { user: userWithoutPassword }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to get profile');
        }
    }

    async updateProfile(profileData) {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Not authenticated');
            }

            const userIndex = this.data.users.findIndex(u => u.id === currentUser.userId);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            // Update user
            if (profileData.name) this.data.users[userIndex].name = profileData.name;
            if (profileData.phone) this.data.users[userIndex].phone = profileData.phone;
            if (profileData.specialization) this.data.users[userIndex].specialization = profileData.specialization;
            this.data.users[userIndex].updated_at = new Date().toISOString();

            const { password, ...userWithoutPassword } = this.data.users[userIndex];

            return {
                success: true,
                message: 'Profile updated successfully',
                data: { user: userWithoutPassword }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to update profile');
        }
    }

    async getAllUsers(params = {}) {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Insufficient permissions');
            }

            let users = this.data.users.filter(u => u.role !== 'admin'); // Don't show admin users

            // Apply filters
            if (params.role) {
                users = users.filter(u => u.role === params.role);
            }

            if (params.search) {
                users = users.filter(u => 
                    u.name.toLowerCase().includes(params.search.toLowerCase()) ||
                    u.email.toLowerCase().includes(params.search.toLowerCase())
                );
            }

            // Apply pagination
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedUsers = users.slice(startIndex, endIndex);

            // Remove passwords
            const usersWithoutPasswords = paginatedUsers.map(u => {
                const { password, ...userWithoutPassword } = u;
                return userWithoutPassword;
            });

            return {
                success: true,
                data: {
                    users: usersWithoutPasswords,
                    pagination: {
                        page,
                        limit,
                        total: users.length,
                        pages: Math.ceil(users.length / limit)
                    }
                }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to fetch users');
        }
    }

    // Consultation APIs
    async createConsultation(consultationData) {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Not authenticated');
            }

            const consultation = {
                id: Date.now().toString(),
                patient_id: currentUser.userId,
                doctor_id: null,
                type: consultationData.type,
                urgency: consultationData.urgency,
                description: consultationData.description,
                preferred_date: consultationData.preferred_date || new Date().toISOString(),
                status: 'pending',
                response: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            this.data.consultations.push(consultation);

            return {
                success: true,
                message: 'Consultation request created successfully',
                data: { consultation }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to create consultation');
        }
    }

    async getConsultations(params = {}) {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Not authenticated');
            }

            let consultations = this.data.consultations;

            // Filter based on user role
            if (currentUser.role === 'patient') {
                consultations = consultations.filter(c => c.patient_id === currentUser.userId);
            } else if (currentUser.role === 'doctor') {
                consultations = consultations.filter(c => c.doctor_id === currentUser.userId || c.doctor_id === null);
            }

            // Add user details
            const consultationsWithUsers = consultations.map(c => {
                const patient = this.data.users.find(u => u.id === c.patient_id);
                const doctor = c.doctor_id ? this.data.users.find(u => u.id === c.doctor_id) : null;
                
                return {
                    ...c,
                    patient: patient ? { id: patient.id, name: patient.name, email: patient.email } : null,
                    doctor: doctor ? { id: doctor.id, name: doctor.name, email: doctor.email } : null
                };
            });

            return {
                success: true,
                data: { consultations: consultationsWithUsers }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to fetch consultations');
        }
    }

    // Prescription APIs
    async getPrescriptions(params = {}) {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Not authenticated');
            }

            let prescriptions = this.data.prescriptions;

            // Filter based on user role
            if (currentUser.role === 'patient') {
                prescriptions = prescriptions.filter(p => p.patient_id === currentUser.userId);
            } else if (currentUser.role === 'doctor') {
                prescriptions = prescriptions.filter(p => p.doctor_id === currentUser.userId);
            }

            return {
                success: true,
                data: { prescriptions }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to fetch prescriptions');
        }
    }

    // Admin APIs
    async getDashboardStats() {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Insufficient permissions');
            }

            const stats = {
                total_users: this.data.users.length,
                total_consultations: this.data.consultations.length,
                total_prescriptions: this.data.prescriptions.length,
                pending_consultations: this.data.consultations.filter(c => c.status === 'pending').length,
                active_doctors: this.data.users.filter(u => u.role === 'doctor' && u.is_active).length,
                active_patients: this.data.users.filter(u => u.role === 'patient' && u.is_active).length
            };

            return {
                success: true,
                data: { stats }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to fetch dashboard stats');
        }
    }

    async getSystemStats() {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Insufficient permissions');
            }

            const stats = {
                users: {
                    total: this.data.users.length,
                    patients: this.data.users.filter(u => u.role === 'patient').length,
                    doctors: this.data.users.filter(u => u.role === 'doctor').length,
                    admins: this.data.users.filter(u => u.role === 'admin').length
                },
                consultations: {
                    total: this.data.consultations.length,
                    pending: this.data.consultations.filter(c => c.status === 'pending').length,
                    completed: this.data.consultations.filter(c => c.status === 'completed').length,
                    cancelled: this.data.consultations.filter(c => c.status === 'cancelled').length
                },
                prescriptions: {
                    total: this.data.prescriptions.length
                }
            };

            return {
                success: true,
                data: { stats }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to fetch system stats');
        }
    }

    // Notification APIs
    async getNotifications(params = {}) {
        await this.initialize();
        
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('Not authenticated');
            }

            let notifications = this.data.notifications.filter(n => n.user_id === currentUser.userId);

            return {
                success: true,
                data: { notifications }
            };

        } catch (error) {
            throw new Error(error.message || 'Failed to fetch notifications');
        }
    }

    // Helper method to get all data for debugging
    async getAllData() {
        await this.initialize();
        return this.data;
    }
}

// Create global service instance
const api = new JSONDataService();

// Export for use in other files
window.JSONDataService = JSONDataService;
window.api = api; 