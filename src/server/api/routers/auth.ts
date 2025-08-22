import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../../../lib/trpc';

export const authRouter = createTRPCRouter({
  test: publicProcedure.query(() => {
    return { message: 'tRPC is working!' };
  }),
  
  testRegister: publicProcedure
    .input(z.object({
      email: z.string(),
      password: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log('Test register input received:', input);
      console.log('Input types:', {
        email: typeof input.email,
        password: typeof input.password,
        name: typeof input.name
      });
      return { success: true, input };
    }),

  testDatabase: publicProcedure
    .query(async ({ ctx }) => {
      try {
        console.log('Testing database connection...');
        console.log('Prisma client:', !!ctx.prisma);
        console.log('Environment:', process.env.NODE_ENV);
        console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
        
        // Test basic connection
        await ctx.prisma.$connect();
        console.log('Prisma connected successfully');
        
        const userCount = await ctx.prisma.user.count();
        console.log('Database connection successful, user count:', userCount);
        return { success: true, userCount, environment: process.env.NODE_ENV };
      } catch (error) {
        console.error('Database connection failed:', error);
        console.error('Error details:', {
          name: (error as any)?.name,
          message: (error as any)?.message,
          code: (error as any)?.code
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Database connection failed: ${(error as any)?.message || 'Unknown error'}`,
          cause: error,
        });
      }
    }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      // Find user
      const user = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          phone: user.phone,
          location: user.location,
          rating: user.rating,
          reviewCount: user.reviewCount,
        },
      };
    }),

  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('Register input received:', JSON.stringify(input, null, 2));
      try {
        console.log('Register mutation started with input:', { email: input.email, name: input.name });
        const { email, password, name } = input;

        console.log('Checking for existing user...');
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          console.log('User already exists:', email);
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User already exists',
          });
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Creating user in database...');
        const user = await ctx.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
          },
        });
        console.log('User created successfully:', user.id);

        console.log('Generating JWT token...');
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );
        console.log('JWT token generated successfully');

        const result = {
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        };
        console.log('Registration completed successfully');
        return result;
      } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Registration failed',
          cause: error,
        });
      }
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        phone: true,
        location: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        profileImage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          phone: true,
          location: true,
          rating: true,
          reviewCount: true,
          updatedAt: true,
        },
      });

      return updatedUser;
    }),
});