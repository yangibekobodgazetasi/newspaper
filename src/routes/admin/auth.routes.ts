import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiError } from '../../middleware/errorHandler';
import { authGuard, signToken } from '../../middleware/auth';
import { normalizeRole } from '../../types/permissions';
import { loginRateLimitGuard, loginAttemptFailed, loginAttemptSucceeded } from '../../middleware/loginRateLimit';

const router = Router();

// Login faqat username+password orqali — email autentifikatsiyada ishtirok etmaydi.
const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/admin/auth/login
router.post(
  '/login',
  loginRateLimitGuard,
  asyncHandler(async (req, res) => {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.adminUser.findUnique({ where: { username: username.toLowerCase().trim() } });

    if (!user || !user.isActive) {
      loginAttemptFailed(req);
      throw new ApiError(401, "Login yoki parol noto'g'ri");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      loginAttemptFailed(req);
      throw new ApiError(401, "Login yoki parol noto'g'ri");
    }

    loginAttemptSucceeded(req);

    // Eskirgan rol (DIZAYNER/MODERATOR) saqlangan bo'lsa, tokenga amaldagi rol
    // yoziladi. `normalizeRole` bunday qiymatni eng kam huquqli rolga tushiradi,
    // shuning uchun eski foydalanuvchi tizimga kiradi-yu, ortiqcha huquq olmaydi.
    const role = normalizeRole(user.role);

    const token = signToken({
      id: user.id,
      username: user.username,
      role,
      fullName: user.fullName,
    });

    res.json({
      token,
      user: { id: user.id, fullName: user.fullName, username: user.username, role },
    });
  })
);

// GET /api/admin/auth/me — admin panel saqlangan (localStorage) foydalanuvchi
// ma'lumotini shu yerdan yangilaydi. Aks holda SUPER_ADMIN kimningdir rolini
// pasaytirsa yoki hisobini o'chirsa, o'sha odamning brauzerida eski rol qolib,
// sidebar unga tegishli bo'lmagan bo'limlarni ko'rsatishda davom etardi.
// (Har bir API chaqiruvi baribir serverda tekshiriladi — bu faqat KO'RINISH uchun.)
router.get(
  '/me',
  authGuard,
  asyncHandler(async (req, res) => {
    const user = await prisma.adminUser.findUnique({ where: { id: req.user!.id } });

    // Hisob o'chirilgan yoki bloklangan bo'lsa token bekor qilinadi.
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Hisob faol emas');
    }

    res.json({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: normalizeRole(user.role),
    });
  })
);

export default router;
