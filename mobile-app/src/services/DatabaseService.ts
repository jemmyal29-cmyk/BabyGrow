/**
 * DatabaseService - Local Database Management
 * Mengelola data lokal menggunakan AsyncStorage dengan struktur database profesional
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const STORAGE_KEYS = {
  USERS: '@babygrow/users',
  CHILDREN: '@babygrow/children',
  MEASUREMENTS: '@babygrow/measurements',
  CURRENT_USER: '@babygrow/current_user',
  MEDICAL_HISTORY: '@babygrow/medical_history',
  IOT_DEVICES: '@babygrow/iot_devices',
  SETTINGS: '@babygrow/settings',
};

export interface User {
  id: string;
  email: string;
  password: string; // Dalam produksi, gunakan hashed password
  fullName: string;
  phone: string;
  role: 'user' | 'admin' | 'super_user';
  profilePicture?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  medicalHistory?: {
    parentHeight: number;
    parentWeight: number;
    chronicDiseases: string[];
    geneticConditions: string[];
    allergies: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Child {
  id: string;
  userId: string;
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  birthWeight?: number;
  birthHeight?: number;
  birthHeadCircumference?: number;
  photo?: string;
  bloodType?: string;
  allergies?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  childId: string;
  weight: number;
  height: number;
  headCircumference?: number;
  measurementDate: string;
  ageMonths: number;
  source: 'manual' | 'iot_mqtt' | 'iot_ble';
  deviceId?: string;
  notes?: string;
  stuntingRisk?: number; // Persentase risiko (0-100)
  riskLevel?: 'normal' | 'at_risk' | 'stunted' | 'severely_stunted';
  recommendations?: string[];
  createdAt: string;
}

export interface IoTDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'esp32' | 'scale' | 'height_meter';
  connectionType: 'mqtt' | 'ble';
  macAddress?: string;
  mqttTopic?: string;
  isActive: boolean;
  lastConnected?: string;
  batteryLevel?: number;
  createdAt: string;
}

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.initializeDatabase();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database dengan data dummy profesional
   */
  private async initializeDatabase(): Promise<void> {
    try {
      const existingUsers = await this.getAllUsers();
      
      // Jika belum ada users, buat data dummy
      if (existingUsers.length === 0) {
        await this.seedDummyData();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  /**
   * Seed data dummy profesional untuk testing
   */
  private async seedDummyData(): Promise<void> {
    const dummyUsers: User[] = [
      {
        id: 'user-001',
        email: 'user@babygrow.app',
        password: 'user123', // Plain text untuk demo, gunakan bcrypt di produksi
        fullName: 'Ibu Sari Wijaya',
        phone: '081234567890',
        role: 'user',
        address: 'Jl. Kenanga No. 15',
        province: 'Jawa Barat',
        city: 'Bandung',
        district: 'Coblong',
        postalCode: '40132',
        medicalHistory: {
          parentHeight: 160,
          parentWeight: 55,
          chronicDiseases: [],
          geneticConditions: [],
          allergies: ['seafood'],
        },
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'admin-001',
        email: 'admin@babygrow.app',
        password: 'admin123',
        fullName: 'Dr. Budi Santoso',
        phone: '081234567891',
        role: 'admin',
        address: 'Puskesmas Bandung Utara',
        province: 'Jawa Barat',
        city: 'Bandung',
        district: 'Cidadap',
        postalCode: '40141',
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
      {
        id: 'superuser-001',
        email: 'superuser@babygrow.app',
        password: 'super123',
        fullName: 'Super Admin BabyGrow',
        phone: '081234567892',
        role: 'super_user',
        address: 'Kantor Pusat BabyGrow',
        province: 'DKI Jakarta',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        postalCode: '12120',
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
    ];

    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dummyUsers));
    
    // Data anak dummy untuk user-001
    const dummyChildren: Child[] = [
      {
        id: 'child-001',
        userId: 'user-001',
        name: 'Zaki Pratama',
        gender: 'male',
        dateOfBirth: '2023-06-15',
        birthWeight: 3.2,
        birthHeight: 50.0,
        birthHeadCircumference: 34.5,
        bloodType: 'O',
        allergies: [],
        notes: 'Anak pertama, sehat',
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date('2025-01-01').toISOString(),
      },
    ];

    await AsyncStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(dummyChildren));

    console.log('✅ Dummy data berhasil dimuat ke database lokal');
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Registrasi user baru (Sign-Up)
   */
  async registerUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const users = await this.getAllUsers();
      
      // Cek email sudah terdaftar
      const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        throw new Error('Email sudah terdaftar');
      }

      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      return newUser;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  /**
   * Login user (Sign-In)
   */
  async loginUser(email: string, password: string): Promise<User> {
    try {
      const users = await this.getAllUsers();
      
      const user = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Email atau password salah');
      }

      // Update last login
      user.lastLogin = new Date().toISOString();
      await this.updateUser(user.id, { lastLogin: user.lastLogin });

      // Simpan current user
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get current logged in user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Logout user
   */
  async logoutUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  /**
   * Update user data
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        throw new Error('User tidak ditemukan');
      }

      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Update current user jika sedang login
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
      }

      return users[userIndex];
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // ==================== CHILD MANAGEMENT ====================

  async addChild(childData: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>): Promise<Child> {
    try {
      const children = await this.getAllChildren();
      
      const newChild: Child = {
        ...childData,
        id: `child-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      children.push(newChild);
      await AsyncStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));

      return newChild;
    } catch (error) {
      console.error('Add child error:', error);
      throw error;
    }
  }

  async getAllChildren(): Promise<Child[]> {
    try {
      const childrenJson = await AsyncStorage.getItem(STORAGE_KEYS.CHILDREN);
      return childrenJson ? JSON.parse(childrenJson) : [];
    } catch (error) {
      console.error('Get all children error:', error);
      return [];
    }
  }

  async getChildrenByUserId(userId: string): Promise<Child[]> {
    try {
      const allChildren = await this.getAllChildren();
      return allChildren.filter(child => child.userId === userId);
    } catch (error) {
      console.error('Get children by user error:', error);
      return [];
    }
  }

  async updateChild(childId: string, updates: Partial<Child>): Promise<Child> {
    try {
      const children = await this.getAllChildren();
      const childIndex = children.findIndex(c => c.id === childId);

      if (childIndex === -1) {
        throw new Error('Anak tidak ditemukan');
      }

      children[childIndex] = {
        ...children[childIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(children));
      return children[childIndex];
    } catch (error) {
      console.error('Update child error:', error);
      throw error;
    }
  }

  // ==================== MEASUREMENT MANAGEMENT ====================

  async addMeasurement(measurementData: Omit<Measurement, 'id' | 'createdAt'>): Promise<Measurement> {
    try {
      const measurements = await this.getAllMeasurements();
      
      const newMeasurement: Measurement = {
        ...measurementData,
        id: `measurement-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      measurements.push(newMeasurement);
      await AsyncStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));

      return newMeasurement;
    } catch (error) {
      console.error('Add measurement error:', error);
      throw error;
    }
  }

  async getAllMeasurements(): Promise<Measurement[]> {
    try {
      const measurementsJson = await AsyncStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
      return measurementsJson ? JSON.parse(measurementsJson) : [];
    } catch (error) {
      console.error('Get all measurements error:', error);
      return [];
    }
  }

  async getMeasurementsByChildId(childId: string): Promise<Measurement[]> {
    try {
      const allMeasurements = await this.getAllMeasurements();
      return allMeasurements
        .filter(m => m.childId === childId)
        .sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime());
    } catch (error) {
      console.error('Get measurements by child error:', error);
      return [];
    }
  }

  // ==================== IOT DEVICE MANAGEMENT ====================

  async registerIoTDevice(deviceData: Omit<IoTDevice, 'id' | 'createdAt'>): Promise<IoTDevice> {
    try {
      const devices = await this.getAllIoTDevices();
      
      const newDevice: IoTDevice = {
        ...deviceData,
        id: `device-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      devices.push(newDevice);
      await AsyncStorage.setItem(STORAGE_KEYS.IOT_DEVICES, JSON.stringify(devices));

      return newDevice;
    } catch (error) {
      console.error('Register IoT device error:', error);
      throw error;
    }
  }

  async getAllIoTDevices(): Promise<IoTDevice[]> {
    try {
      const devicesJson = await AsyncStorage.getItem(STORAGE_KEYS.IOT_DEVICES);
      return devicesJson ? JSON.parse(devicesJson) : [];
    } catch (error) {
      console.error('Get all IoT devices error:', error);
      return [];
    }
  }

  async getIoTDevicesByUserId(userId: string): Promise<IoTDevice[]> {
    try {
      const allDevices = await this.getAllIoTDevices();
      return allDevices.filter(device => device.userId === userId);
    } catch (error) {
      console.error('Get IoT devices by user error:', error);
      return [];
    }
  }

  // ==================== UTILITY ====================

  /**
   * Clear all data (untuk testing)
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('✅ Semua data berhasil dihapus');
    } catch (error) {
      console.error('Clear data error:', error);
      throw error;
    }
  }

  /**
   * Reset ke data dummy
   */
  async resetToDefaultData(): Promise<void> {
    try {
      await this.clearAllData();
      await this.seedDummyData();
      console.log('✅ Data berhasil direset ke default');
    } catch (error) {
      console.error('Reset data error:', error);
      throw error;
    }
  }
}

export default DatabaseService.getInstance();
