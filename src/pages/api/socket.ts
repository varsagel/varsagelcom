import { NextApiRequest } from 'next'
import { NextApiResponseServerIO } from '@/lib/socket'
import { Server as ServerIO } from 'socket.io'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
    res.end()
    return
  }

  console.log('Socket is initializing')
  const io = new ServerIO(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3001',
      methods: ['GET', 'POST']
    }
  })
  res.socket.server.io = io

  // Kullanıcı bağlantı yönetimi
  const connectedUsers = new Map<string, string>() // userId -> socketId
  const userSockets = new Map<string, string>() // socketId -> userId

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    // Kullanıcı kimlik doğrulama
    socket.on('authenticate', async (token: string) => {
      try {
        // Token'dan session bilgisini al
        const session = await getServerSession(authOptions)
        if (session?.user?.id) {
          const userId = session.user.id
          connectedUsers.set(userId, socket.id)
          userSockets.set(socket.id, userId)
          
          socket.join(`user_${userId}`)
          console.log(`User ${userId} authenticated and joined room`)
          
          // Online kullanıcıları güncelle
          io.emit('user_online', { userId, socketId: socket.id })
        }
      } catch (error) {
        console.error('Authentication error:', error)
        socket.emit('auth_error', 'Authentication failed')
      }
    })

    // Konuşmaya katılma
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`)
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
    })

    // Konuşmadan ayrılma
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`)
      console.log(`Socket ${socket.id} left conversation ${conversationId}`)
    })

    // Mesaj gönderme
    socket.on('send_message', async (data: {
      content: string
      conversationId: string
      tempId?: string
    }) => {
      try {
        const userId = userSockets.get(socket.id)
        if (!userId) {
          socket.emit('error', 'User not authenticated')
          return
        }

        // Mesajı veritabanına kaydet
        const message = await prisma.message.create({
          data: {
            content: data.content,
            conversationId: data.conversationId,
            userId: userId
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        // Konuşmadaki tüm kullanıcılara mesajı gönder
        io.to(`conversation_${data.conversationId}`).emit('new_message', {
          ...message,
          tempId: data.tempId
        })

        console.log(`Message sent to conversation ${data.conversationId}`)
      } catch (error) {
        console.error('Send message error:', error)
        socket.emit('error', 'Failed to send message')
      }
    })

    // Yazıyor durumu
    socket.on('typing_start', (data: { conversationId: string }) => {
      const userId = userSockets.get(socket.id)
      if (userId) {
        socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
          userId,
          conversationId: data.conversationId,
          isTyping: true
        })
      }
    })

    socket.on('typing_stop', (data: { conversationId: string }) => {
      const userId = userSockets.get(socket.id)
      if (userId) {
        socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
          userId,
          conversationId: data.conversationId,
          isTyping: false
        })
      }
    })

    // Mesaj okundu işaretleme
    socket.on('mark_messages_read', async (data: {
      conversationId: string
      messageIds: string[]
    }) => {
      try {
        const userId = userSockets.get(socket.id)
        if (!userId) return

        // Mesajları okundu olarak işaretle
        await prisma.messageRead.createMany({
          data: data.messageIds.map(messageId => ({
            messageId,
            userId,
            readAt: new Date()
          })),
          skipDuplicates: true
        })

        // Diğer kullanıcılara bildir
        socket.to(`conversation_${data.conversationId}`).emit('messages_read', {
          userId,
          messageIds: data.messageIds,
          readAt: new Date().toISOString()
        })
      } catch (error) {
        console.error('Mark messages read error:', error)
      }
    })

    // Bildirim gönderme
    socket.on('send_notification', async (data: {
      userId: string
      type: string
      title: string
      message: string
      data?: any
    }) => {
      try {
        // Bildirimi veritabanına kaydet
        const notification = await prisma.notification.create({
          data: {
            userId: data.userId,
            type: data.type as any,
            title: data.title,
            message: data.message,
            data: data.data
          }
        })

        // Kullanıcıya bildirim gönder
        io.to(`user_${data.userId}`).emit('new_notification', notification)
      } catch (error) {
        console.error('Send notification error:', error)
      }
    })

    // Bağlantı koptuğunda
    socket.on('disconnect', () => {
      const userId = userSockets.get(socket.id)
      if (userId) {
        connectedUsers.delete(userId)
        userSockets.delete(socket.id)
        
        // Offline durumunu bildir
        io.emit('user_offline', { userId, socketId: socket.id })
        console.log(`User ${userId} disconnected`)
      }
      console.log('Client disconnected:', socket.id)
    })
  })

  console.log('Socket.IO server initialized')
  res.end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default SocketHandler