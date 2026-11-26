import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authGuard, requirePermission } from '../../middleware/auth';
import { ApiError, NotFoundError } from '../../middleware/errorHandler';
import { ACTIVE_ADMIN_ROLES, isDeprecatedRole } from '../../types/permissions';

const router = Router();
router.use(authGuard, requirePermission('users:manage'));

// Haqiqiy username formati — email emas: kichik lotin harfi bilan boshlanadi, keyin
// harf/raqam/pastki chiziq, 3-20 belgi.
const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;
const usernameField = z
  .string()
  .regex(USERNAME_REGEX, "Username kichik lotin harfi bilan boshlanishi, faqat harf/raqam/pastki chiziqdan iborat bo'lishi va 3-20 belgi bo'lishi kerak");

// MUHIM: `passwordHash` hech qachon javobga qo'shilmaydi.
// Email autentifikatsiyada ishtirok etmaydi, shuning uchun user management API'sidan ham chiqarildi.
function serializeUser(user: { id: string; fullName: string; username: string; role: string; isActive: boolean }) {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    role: user.role,
    // Eskirgan rol saqlanib qolgan bo'lsa admin panelda ogohlantirish ko'rsatiladi —
    // bunday foydalanuvchi amalda eng kam huquq bilan ishlaydi (bkl. normalizeRole).
    roleDeprecated: isDeprecatedRole(user.role),
    isActive: user.isActive,
  };
}

// GET /api/admin/users
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await prisma.adminUser.findMany({ orderBy: { fullName: 'asc' } });
    res.json({ items: users.map(serializeUser) });
  })
);

const createSchema = z.object({
  fullName: z.string().min(2),
  username: usernameField,
  password: z.string().min(6),
  role: z.enum(ACTIVE_ADMIN_ROLES),
});

// POST /api/admin/users
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);

    const existingUsername = await prisma.adminUser.findUnique({ where: { username: data.username } });
    if (existingUsername) throw new ApiError(409, "Bu username allaqachon band");

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.adminUser.create({
      data: { fullName: data.fullName, username: data.username, passwordHash, role: data.role },
    });

    res.status(201).json(serializeUser(user));
  })
);

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  username: usernameField.optional(),
  role: z.enum(ACTIVE_ADMIN_ROLES).optional(),
  isActive: z.boolean().optional(),
  // Parol yuborilmasa — o'zgarmaydi. Mavjud parol hech qachon o'qib olinmaydi/qaytarilmaydi.
  password: z.string().min(6).optional(),
});

// PUT /api/admin/users/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const existing = await prisma.adminUser.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Foydalanuvchi topilmadi');

    if (data.username && data.username !== existing.username) {
      const usernameTaken = await prisma.adminUser.findUnique({ where: { username: data.username } });
      if (usernameTaken) throw new ApiError(409, "Bu username allaqachon band");
    }

    // Parol yuborilmagan bo'lsa `undefined` — Prisma uni o'zgartirmaydi (eski hash saqlanadi).
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;

    const user = await prisma.adminUser.update({
      where: { id: req.params.id },
      data: {
        fullName: data.fullName,
        username: data.username,
        role: data.role,
        isActive: data.isActive,
        passwordHash,
      },
    });

    res.json(serializeUser(user));
  })
);

// DELETE /api/admin/users/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.adminUser.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Foydalanuvchi topilmadi');

    await prisma.adminUser.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  })
);

export default router;
