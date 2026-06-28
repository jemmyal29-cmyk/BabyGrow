# BabyGrow - Security & Compliance Guide

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
│                                                                  │
│  Layer 1: Network Security                                      │
│  ├─ HTTPS/TLS 1.3 only                                         │
│  ├─ Certificate pinning (mobile app)                            │
│  ├─ DDoS protection (CloudFront/CloudFlare)                     │
│  └─ VPC & Security Groups (AWS)                                 │
│                                                                  │
│  Layer 2: Application Security                                  │
│  ├─ JWT authentication                                          │
│  ├─ Rate limiting (100 req/min)                                 │
│  ├─ Input validation & sanitization                             │
│  ├─ SQL injection prevention (prepared statements)              │
│  ├─ XSS protection (CSP headers)                                │
│  └─ CORS configuration                                          │
│                                                                  │
│  Layer 3: Data Security                                         │
│  ├─ Encryption at rest (AES-256)                                │
│  ├─ Encryption in transit (TLS)                                 │
│  ├─ Database encryption (RDS)                                   │
│  ├─ Secure key management (AWS KMS)                             │
│  └─ Sensitive data hashing (bcrypt)                             │
│                                                                  │
│  Layer 4: Access Control                                        │
│  ├─ Role-Based Access Control (RBAC)                            │
│  ├─ Principle of least privilege                                │
│  ├─ Multi-factor authentication (future)                        │
│  └─ Session management                                          │
│                                                                  │
│  Layer 5: Monitoring & Response                                 │
│  ├─ Security logging                                            │
│  ├─ Intrusion detection                                         │
│  ├─ Incident response plan                                      │
│  └─ Regular security audits                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 Authentication & Authorization

### JWT Token Structure

```typescript
// Access Token (15 minutes expiry)
interface AccessTokenPayload {
  sub: string;           // User ID
  email: string;
  role: string;          // 'parent', 'health_worker', 'admin'
  iat: number;           // Issued at
  exp: number;           // Expiration
}

// Refresh Token (7 days expiry)
interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;  // For token invalidation
  iat: number;
  exp: number;
}
```

### Authentication Implementation

```typescript
// backend/src/modules/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.email_verified) {
      throw new UnauthorizedException('Email not verified');
    }

    const { password_hash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'parent',
    };

    // Generate tokens
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        tokenVersion: user.token_version || 0,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        profile_picture_url: user.profile_picture_url,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersService.findById(payload.sub);

      if (!user || user.token_version !== payload.tokenVersion) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      );

      return { access_token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password_hash: hashedPassword,
      email_verified: false,
    });

    // Send verification email
    await this.sendVerificationEmail(user);

    return {
      message: 'Registration successful. Please verify your email.',
      user_id: user.id,
    };
  }

  async sendVerificationEmail(user: any) {
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET, expiresIn: '24h' },
    );

    const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;

    // Send email (using SendGrid or similar)
    // await this.emailService.send({
    //   to: user.email,
    //   subject: 'Verify your email',
    //   template: 'verification',
    //   context: { verificationLink }
    // });
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      await this.usersService.updateEmailVerified(payload.sub, true);

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
```

### Authorization Guards

```typescript
// backend/src/common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user.role === role);
  }
}

// Usage in controller
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles('admin')
  getAllUsers() {
    // Only accessible by admin
  }
}
```

## 🛡️ Data Protection

### Sensitive Data Encryption

```typescript
// backend/src/common/utils/encryption.ts

import * as crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    // Get key from environment or AWS KMS
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Usage example
const encryptionService = new EncryptionService();

// Encrypt sensitive data before storing
const encryptedPhone = encryptionService.encrypt(user.phone_number);

// Decrypt when needed
const decryptedPhone = encryptionService.decrypt(encryptedPhone);
```

### Password Security

```typescript
// Password hashing with bcrypt
import * as bcrypt from 'bcrypt';

// Hashing
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verification
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

// Password strength validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// At least 8 characters
// At least one uppercase letter
// At least one lowercase letter
// At least one number
// At least one special character
```

### Database Security

```sql
-- Enable encryption at rest (AWS RDS)
-- Encryption is enabled during instance creation

-- Row-level security example (PostgreSQL)
CREATE POLICY user_isolation_policy ON children
    USING (user_id = current_setting('app.current_user_id')::uuid);

-- Secure database connection
-- Use SSL/TLS for database connections
-- Connection string example:
-- postgresql://user:password@host:5432/dbname?sslmode=require

-- Audit logging
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, action, user_id, new_data)
        VALUES (TG_TABLE_NAME, 'INSERT', NEW.user_id, row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, 'UPDATE', NEW.user_id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, action, user_id, old_data)
        VALUES (TG_TABLE_NAME, 'DELETE', OLD.user_id, row_to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sensitive tables
CREATE TRIGGER children_audit
    AFTER INSERT OR UPDATE OR DELETE ON children
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

## 🚨 Input Validation & Sanitization

### Backend Validation

```typescript
// backend/src/modules/children/dto/create-child.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsDateString()
  date_of_birth: string;

  @IsEnum(['male', 'female'])
  gender: string;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(10)
  birth_weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(70)
  birth_height?: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

// Measurement validation
export class CreateMeasurementDto {
  @IsNumber()
  @Min(2)
  @Max(30)
  weight_kg: number;

  @IsNumber()
  @Min(40)
  @Max(130)
  height_cm: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(60)
  head_circumference_cm?: number;

  @IsDateString()
  measured_at: string;
}
```

### SQL Injection Prevention

```typescript
// NEVER do this
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ALWAYS use parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);

// With TypeORM
const user = await this.userRepository.findOne({
  where: { email: email }  // Safe - uses parameterized queries
});
```

### XSS Prevention

```typescript
// Backend - Set security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// Mobile app - Sanitize user input before rendering
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userInput);
```

## 🔍 Rate Limiting & DDoS Protection

```typescript
// backend/src/main.ts

import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window in seconds
      limit: 100,   // Maximum requests per ttl
    }),
  ],
})
export class AppModule {}

// Apply to specific routes
@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle(5, 60)  // 5 requests per minute
  async login(@Body() loginDto: LoginDto) {
    // Login logic
  }
}

// Custom rate limiting by user
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Rate limit by user ID instead of IP
    return req.user?.id || req.ip;
  }
}
```

## 📱 Mobile App Security

### Secure Storage

```typescript
// mobile-app/src/utils/secureStorage.ts

import EncryptedStorage from 'react-native-encrypted-storage';

export class SecureStorage {
  static async setItem(key: string, value: any): Promise<void> {
    try {
      await EncryptedStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
    }
  }

  static async getItem(key: string): Promise<any> {
    try {
      const value = await EncryptedStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      await EncryptedStorage.clear();
    } catch (error) {
      console.error('SecureStorage clear error:', error);
    }
  }
}

// Usage
await SecureStorage.setItem('access_token', token);
const token = await SecureStorage.getItem('access_token');
```

### Certificate Pinning

```typescript
// mobile-app/src/api/config.ts

import axios from 'axios';
import { Platform } from 'react-native';

// For React Native, use react-native-ssl-pinning
import { fetch as sslFetch } from 'react-native-ssl-pinning';

export const api = axios.create({
  baseURL: process.env.API_URL,
  timeout: 10000,
});

// SSL Pinning configuration
const sslPinningConfig = {
  hostname: 'api.babygrow.app',
  publicKeyHashes: [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Your certificate hash
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Backup certificate hash
  ],
};

// Use SSL pinning for sensitive requests
export async function secureRequest(url: string, options: any) {
  return await sslFetch(url, {
    ...options,
    sslPinning: sslPinningConfig,
  });
}
```

### Biometric Authentication

```typescript
// mobile-app/src/utils/biometrics.ts

import ReactNativeBiometrics from 'react-native-biometrics';

export class BiometricAuth {
  static async isBiometricAvailable(): Promise<boolean> {
    const rnBiometrics = new ReactNativeBiometrics();
    const { available } = await rnBiometrics.isSensorAvailable();
    return available;
  }

  static async authenticate(reason: string): Promise<boolean> {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: reason,
        cancelButtonText: 'Cancel',
      });

      return success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  }

  static async createKeys(): Promise<string> {
    const rnBiometrics = new ReactNativeBiometrics();
    const { publicKey } = await rnBiometrics.createKeys();
    return publicKey;
  }
}

// Usage
const isAvailable = await BiometricAuth.isBiometricAvailable();

if (isAvailable) {
  const success = await BiometricAuth.authenticate('Authenticate to login');
  if (success) {
    // Proceed with login
  }
}
```

## 📋 Privacy & Compliance

### GDPR Compliance (if applicable)

```typescript
// User data export
@Get('export-data')
@UseGuards(JwtAuthGuard)
async exportUserData(@Req() req) {
  const userId = req.user.id;
  
  const userData = {
    user: await this.usersService.findById(userId),
    children: await this.childrenService.findByUserId(userId),
    measurements: await this.measurementsService.findByUserId(userId),
    // ... other user data
  };

  return userData;
}

// Right to be forgotten
@Delete('delete-account')
@UseGuards(JwtAuthGuard)
async deleteAccount(@Req() req) {
  const userId = req.user.id;
  
  // Anonymize data instead of hard delete (for analytics)
  await this.usersService.anonymize(userId);
  
  // Or hard delete
  // await this.usersService.delete(userId);
  
  return { message: 'Account deleted successfully' };
}
```

### Privacy Policy & Terms

```markdown
# Privacy Policy (Simplified)

## Data We Collect
- Personal information (name, email)
- Child information (name, date of birth, gender)
- Health measurements (weight, height)
- Device information
- Usage data

## How We Use Data
- Provide health monitoring services
- AI-powered stunting risk assessment
- Personalized nutrition recommendations
- Improve our services

## Data Sharing
- We do NOT sell your data
- Data shared only with:
  - Healthcare providers (with consent)
  - Analytics services (anonymized)

## Data Security
- Encryption at rest and in transit
- Regular security audits
- Access controls

## Your Rights
- Access your data
- Export your data
- Delete your data
- Opt-out of analytics

## Contact
privacy@babygrow.app
```

## 🔒 Security Checklist

### Pre-Launch Security Audit

- [ ] **Authentication**
  - [ ] Password strength requirements enforced
  - [ ] Secure password hashing (bcrypt)
  - [ ] JWT tokens properly signed
  - [ ] Refresh token rotation implemented
  - [ ] Session timeout configured

- [ ] **Authorization**
  - [ ] RBAC implemented correctly
  - [ ] User can only access own data
  - [ ] Admin routes protected
  - [ ] API endpoints have auth guards

- [ ] **Data Protection**
  - [ ] Sensitive data encrypted at rest
  - [ ] TLS/HTTPS enforced everywhere
  - [ ] Database credentials secured
  - [ ] API keys in environment variables
  - [ ] Secrets management (AWS Secrets Manager)

- [ ] **Input Validation**
  - [ ] All inputs validated on backend
  - [ ] SQL injection prevention
  - [ ] XSS prevention
  - [ ] File upload validation
  - [ ] Rate limiting enabled

- [ ] **Mobile App**
  - [ ] Certificate pinning implemented
  - [ ] Secure storage for tokens
  - [ ] Biometric auth (optional)
  - [ ] Code obfuscation
  - [ ] Root detection

- [ ] **Infrastructure**
  - [ ] Firewall rules configured
  - [ ] VPC security groups set
  - [ ] Database not publicly accessible
  - [ ] Backup & recovery tested
  - [ ] Monitoring & alerting active

- [ ] **Compliance**
  - [ ] Privacy policy published
  - [ ] Terms of service published
  - [ ] Data export functionality
  - [ ] Data deletion functionality
  - [ ] User consent mechanisms

- [ ] **Incident Response**
  - [ ] Security incident response plan
  - [ ] Breach notification procedure
  - [ ] Security contact email
  - [ ] Logging & monitoring

## 📞 Security Contact

For security issues, contact: **security@babygrow.app**

---

**Security is an ongoing process. Regular audits and updates are essential!**
