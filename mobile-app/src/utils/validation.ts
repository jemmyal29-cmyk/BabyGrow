/**
 * BabyGrow Validation Schemas - Zero-Error Input Validation
 * Powered by Zod for TypeScript-first schema validation
 */

import { z } from 'zod';

// ==================== MEASUREMENT VALIDATION ====================

export const MeasurementSchema = z.object({
  weight_kg: z
    .number({
      required_error: 'Berat badan harus diisi',
      invalid_type_error: 'Berat badan harus berupa angka',
    })
    .min(2, 'Berat badan terlalu rendah (minimal 2 kg)')
    .max(30, 'Berat badan terlalu tinggi (maksimal 30 kg)')
    .refine(
      (n) => {
        // Max 2 decimal places
        const decimals = (n.toString().split('.')[1] || '').length;
        return decimals <= 2;
      },
      { message: 'Maksimal 2 angka di belakang koma (contoh: 10.25)' }
    ),

  height_cm: z
    .number({
      required_error: 'Tinggi badan harus diisi',
      invalid_type_error: 'Tinggi badan harus berupa angka',
    })
    .min(40, 'Tinggi badan terlalu rendah (minimal 40 cm)')
    .max(130, 'Tinggi badan terlalu tinggi (maksimal 130 cm)')
    .refine(
      (n) => {
        // Max 1 decimal place
        const decimals = (n.toString().split('.')[1] || '').length;
        return decimals <= 1;
      },
      { message: 'Maksimal 1 angka di belakang koma (contoh: 78.5)' }
    ),

  head_circumference_cm: z
    .number()
    .min(30, 'Lingkar kepala terlalu kecil')
    .max(60, 'Lingkar kepala terlalu besar')
    .optional(),

  measured_at: z
    .date({
      required_error: 'Tanggal pengukuran harus diisi',
      invalid_type_error: 'Format tanggal tidak valid',
    })
    .max(new Date(), 'Tanggal tidak boleh di masa depan')
    .refine(
      (date) => {
        // Max 1 year in the past
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return date >= oneYearAgo;
      },
      { message: 'Tanggal pengukuran terlalu lama (maksimal 1 tahun yang lalu)' }
    ),

  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
});

export type MeasurementInput = z.infer<typeof MeasurementSchema>;

// ==================== CHILD DATA VALIDATION ====================

export const ChildSchema = z.object({
  name: z
    .string({
      required_error: 'Nama anak harus diisi',
    })
    .min(2, 'Nama terlalu pendek (minimal 2 karakter)')
    .max(50, 'Nama terlalu panjang (maksimal 50 karakter)')
    .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh huruf dan spasi'),

  gender: z.enum(['male', 'female'], {
    required_error: 'Jenis kelamin harus dipilih',
    invalid_type_error: 'Jenis kelamin tidak valid',
  }),

  date_of_birth: z
    .date({
      required_error: 'Tanggal lahir harus diisi',
      invalid_type_error: 'Format tanggal tidak valid',
    })
    .max(new Date(), 'Tanggal lahir tidak boleh di masa depan')
    .refine(
      (date) => {
        // Max 5 years old (60 months)
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        return date >= fiveYearsAgo;
      },
      { message: 'Anak terlalu tua untuk aplikasi ini (maksimal 5 tahun)' }
    ),

  birth_weight: z
    .number()
    .min(0.5, 'Berat lahir terlalu rendah')
    .max(7, 'Berat lahir terlalu tinggi')
    .optional(),

  birth_height: z
    .number()
    .min(30, 'Tinggi lahir terlalu rendah')
    .max(60, 'Tinggi lahir terlalu tinggi')
    .optional(),

  blood_type: z
    .enum(['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),

  allergies: z.array(z.string()).optional(),

  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
});

export type ChildInput = z.infer<typeof ChildSchema>;

// ==================== AUTHENTICATION VALIDATION ====================

export const LoginSchema = z.object({
  email: z
    .string({
      required_error: 'Email harus diisi',
    })
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'Password harus diisi',
    })
    .min(6, 'Password minimal 6 karakter'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    full_name: z
      .string({
        required_error: 'Nama lengkap harus diisi',
      })
      .min(3, 'Nama terlalu pendek (minimal 3 karakter)')
      .max(100, 'Nama terlalu panjang'),

    email: z
      .string({
        required_error: 'Email harus diisi',
      })
      .email('Format email tidak valid')
      .toLowerCase()
      .trim(),

    phone: z
      .string({
        required_error: 'Nomor HP harus diisi',
      })
      .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor HP tidak valid (contoh: 08123456789)'),

    password: z
      .string({
        required_error: 'Password harus diisi',
      })
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
      .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),

    confirm_password: z.string({
      required_error: 'Konfirmasi password harus diisi',
    }),

    agree_terms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Anda harus menyetujui syarat dan ketentuan',
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ==================== AI VISION VALIDATION ====================

export const AIVisionInputSchema = z.object({
  image_uri: z
    .string({
      required_error: 'Gambar harus dipilih',
    })
    .url('Format URI gambar tidak valid')
    .refine(
      (uri) => {
        // Check file extension
        return /\.(jpg|jpeg|png|webp)$/i.test(uri);
      },
      { message: 'Format gambar harus JPG, PNG, atau WEBP' }
    ),

  child_id: z.string().uuid('ID anak tidak valid'),

  manual_height: z
    .number()
    .min(40, 'Tinggi manual terlalu rendah')
    .max(130, 'Tinggi manual terlalu tinggi')
    .optional(),
});

export type AIVisionInput = z.infer<typeof AIVisionInputSchema>;

// ==================== MBG RECIPE VALIDATION ====================

export const RecipeSchema = z.object({
  title: z
    .string()
    .min(5, 'Judul terlalu pendek')
    .max(100, 'Judul terlalu panjang'),

  description: z.string().max(500, 'Deskripsi terlalu panjang').optional(),

  category: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),

  age_range: z.object({
    min: z.number().min(0, 'Usia minimal tidak valid').max(60),
    max: z.number().min(0).max(60, 'Usia maksimal tidak valid'),
  }),

  nutrition: z.object({
    calories: z.number().min(0, 'Kalori harus positif').max(1000),
    protein: z.number().min(0, 'Protein harus positif').max(100),
    iron: z.number().min(0, 'Zat besi harus positif').max(50),
    calcium: z.number().min(0, 'Kalsium harus positif').max(1000),
  }),

  ingredients: z.array(z.string()).min(1, 'Minimal 1 bahan'),

  instructions: z.array(z.string()).min(1, 'Minimal 1 langkah'),

  prep_time: z.number().min(0).max(120, 'Waktu persiapan terlalu lama'),

  cook_time: z.number().min(0).max(180, 'Waktu masak terlalu lama'),

  servings: z.number().min(1, 'Minimal 1 porsi').max(10),
});

export type RecipeInput = z.infer<typeof RecipeSchema>;

// ==================== ADMIN VALIDATION ====================

export const AdminReportSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
  region: z.string().optional(),
  export_format: z.enum(['pdf', 'excel', 'csv']),
});

export type AdminReportInput = z.infer<typeof AdminReportSchema>;

// ==================== FILE UPLOAD VALIDATION ====================

export const FileUploadSchema = z.object({
  file_uri: z.string().url(),
  file_type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  file_size: z
    .number()
    .max(10 * 1024 * 1024, 'Ukuran file maksimal 10MB'), // 10MB
});

export type FileUploadInput = z.infer<typeof FileUploadSchema>;

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate and sanitize input
 * Returns parsed data or throws ZodError
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation (returns result with errors)
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Get user-friendly error messages
 */
export function getErrorMessages(error: z.ZodError): string[] {
  return error.errors.map((err) => err.message);
}

/**
 * Get field-specific errors for forms
 */
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    if (field) {
      fieldErrors[field] = err.message;
    }
  });
  return fieldErrors;
}

// ==================== EXPORT ALL ====================

export const schemas = {
  measurement: MeasurementSchema,
  child: ChildSchema,
  login: LoginSchema,
  register: RegisterSchema,
  aiVision: AIVisionInputSchema,
  recipe: RecipeSchema,
  adminReport: AdminReportSchema,
  fileUpload: FileUploadSchema,
};

export default schemas;
