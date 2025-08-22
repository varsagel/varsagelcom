import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../../../lib/trpc';

export const authRouter = createTRPCRouter({
  checkEnv: publicProcedure
    .query(async ({ ctx }) => {
      const envStatus = {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_exists: !!process.env.DATABASE_URL,
        DIRECT_URL_exists: !!process.env.DIRECT_URL,
        SUPABASE_URL_exists: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY_exists: !!process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        JWT_SECRET_exists: !!process.env.JWT_SECRET,
      };

      let supabaseStatus = 'not_tested';
      try {
        const { count } = await ctx.supabase
          .from('User')
          .select('*', { count: 'exact', head: true });
        supabaseStatus = 'connected';
      } catch (error) {
        supabaseStatus = `error: ${(error as Error).message || 'Unknown error'}`;
      }

      return {
        env: envStatus,
        supabase: supabaseStatus,
      };
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
        console.log('Supabase client:', !!ctx.supabase);
        console.log('Environment:', process.env.NODE_ENV);
        console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
        
        // Test basic connection
        const { count, error } = await ctx.supabase
           .from('User')
           .select('*', { count: 'exact', head: true });
        
        if (error) {
          throw new Error(`Supabase connection failed: ${error.message}`);
        }
        
        console.log('Supabase connected successfully');
        const userCount = count || 0;
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
      const { data: user, error } = await ctx.supabase
         .from('User')
         .select('id, email, name, password, profileImage, phone, location, rating, reviewCount')
         .eq('email', email)
         .single();
      
      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database error',
        });
      }

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
      console.log('=== REGISTER MUTATION START ===');
      console.log('Environment Variables Check:');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
      console.log('DIRECT_URL exists:', !!process.env.DIRECT_URL);
      console.log('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
      console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
      console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
      console.log('Supabase client exists:', !!ctx.supabase);
      console.log('Raw input type:', typeof input);
      console.log('Raw input:', input);
      console.log('Input keys:', Object.keys(input || {}));
      console.log('Email type:', typeof input?.email, 'Value:', input?.email);
      console.log('Password type:', typeof input?.password, 'Value:', input?.password ? '[REDACTED]' : input?.password);
      console.log('Name type:', typeof input?.name, 'Value:', input?.name);
      console.log('Register input received:', JSON.stringify(input, null, 2));
      try {
        console.log('Register mutation started with input:', { email: input.email, name: input.name });
        const { email, password, name } = input;

        console.log('Checking for existing user...');
        const { data: existingUser, error: checkError } = await ctx.supabase
          .from('User')
          .select('id')
          .eq('email', email)
          .single();

        if (existingUser && !checkError) {
          console.log('User already exists:', email);
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User already exists',
          });
        }

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Creating user in database...');
        const { nanoid } = await import('nanoid');
        const userId = nanoid();
        const now = new Date().toISOString();
        
        const { data: user, error: createError } = await ctx.supabase
          .from('User')
          .insert({
            id: userId,
            email,
            password: hashedPassword,
            name,
            createdAt: now,
            updatedAt: now,
          })
          .select('id, email, name')
          .single();

        if (createError || !user) {
          console.error('Failed to create user:', createError);
          console.error('Create error details:', JSON.stringify(createError, null, 2));
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to create user: ${createError?.message || 'Unknown error'}`,
          });
        }
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
    const { data: user, error } = await ctx.supabase
       .from('User')
       .select('id, email, name, profileImage, phone, location, rating, reviewCount, createdAt, updatedAt')
       .eq('id', ctx.session.user.id)
       .single();
    
    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Database error',
      });
    }

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
      const { data: updatedUser, error } = await ctx.supabase
         .from('User')
         .update(input)
         .eq('id', ctx.session.user.id)
         .select('id, email, name, profileImage, phone, location, rating, reviewCount, updatedAt')
         .single();
      
      if (error || !updatedUser) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        });
      }

      return updatedUser;
    }),
});