import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { redis } from '../../lib/redis';
import { prisma } from '../../lib/prisma';

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Valid 10 digit Indian phone number required' });
    }

    // Rate limit: Max 3 OTPs per phone per hour
    const rlKey = `rate:otp:${phone}`;
    const requests = await redis.incr(rlKey);
    if (requests === 1) {
      await redis.expire(rlKey, 3600); // 1 hour window
    }
    if (requests > 3) {
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }

    const otp = crypto.randomInt(100000, 999999);
    const hash = await bcrypt.hash(otp.toString(), 10);
    
    // Store hash and attempts in Redis (10 minutes)
    await redis.setEx(`otp:${phone}`, 600, JSON.stringify({ hash, attempts: 0 }));

    // Send SMS via Fast2SMS 
    // In production, uncomment and import axios:
    /*
    await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'q',
      numbers: phone,
      message: `Your OTP is ${otp}. Valid 10 mins. -SuperApp`,
      language: 'english'
    }, {
      headers: { authorization: process.env.FAST2SMS_KEY }
    });
    */
    
    console.log(`[DEV MODE] OTP for ${phone} is ${otp}`);

    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const dataRaw = await redis.get(`otp:${phone}`);
    if (!dataRaw) {
      return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    const data = JSON.parse(dataRaw);
    
    if (data.attempts >= 3) {
      await redis.del(`otp:${phone}`);
      return res.status(400).json({ error: 'Too many invalid attempts. Request new OTP.' });
    }

    const isValid = await bcrypt.compare(otp.toString(), data.hash);
    if (!isValid) {
      // Increment attempts
      data.attempts += 1;
      await redis.set(`otp:${phone}`, JSON.stringify(data), { KEEPTTL: true });
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Validated successfully
    let isNewUser = false;
    let user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          phone,
          role: 'customer'
        }
      });
    }

    // Include businessId if vendor
    let businessId = undefined;
    if (user.role === 'vendor') {
      const business = await prisma.business.findFirst({ where: { userId: user.id } });
      if (business) businessId = business.id;
    }

    const payload = {
      userId: user.id,
      role: user.role,
      businessId
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

    await redis.del(`otp:${phone}`);

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
      is_new_user: isNewUser
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};
