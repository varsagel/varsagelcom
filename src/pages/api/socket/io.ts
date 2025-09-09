import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
  end: () => void
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')

    const io = new ServerIO(res.socket.server, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    })

    // Kullanıcı bağlantı yönetimi
    const connectedUsers = new Map<string, string>() // userId -> socketId

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id)

      // Kullanıcı kimlik doğrulama
      socket.on('authenticate', async (data: { userId: string }) => {
        try {
          // Kullanıcı ID'sini doğrula
          const user = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { id: true, name: true, email: true }
          })
          
          if (user) {
            socket.userId = user.id
            connectedUsers.set(user.id, socket.id)
            
            // Kullanıcıyı kendi odasına ekle
            socket.join(`user:${user.id}`)
            
            console.log(`User ${user.id} authenticated and joined room`)
            
            // Kullanıcının aktif konuşmalarına katıl
            const conversations = await prisma.conversation.findMany({
              where: {
                participants: {
                  some: {
                    userId: user.id
                  }
                }
              },
              select: {
                id: true
              }
            })
            
            conversations.forEach(conv => {
              socket.join(`conversation:${conv.id}`)
            })
            
            socket.emit('authenticated', { 
              success: true, 
              userId: user.id 
            })
          } else {
            socket.emit('authentication_error', { message: 'Invalid user' })
          }
        } catch (error) {
          console.error('Authentication error:', error)
          socket.emit('authentication_error', { message: 'Authentication failed' })
        }
      })

      // Konuşmaya katılma
      socket.on('join_conversation', async (conversationId: string) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' })
            return
          }

          // Kullanıcının bu konuşmaya erişim yetkisi var mı kontrol et
          const conversation = await prisma.conversation.findFirst({
            where: {
              id: conversationId,
              participants: {
                some: {
                  userId: socket.userId
                }
              }
            }
          })

          if (conversation) {
            socket.join(`conversation:${conversationId}`)
            console.log(`User ${socket.userId} joined conversation ${conversationId}`)
            
            // Diğer katılımcılara kullanıcının online olduğunu bildir
            socket.to(`conversation:${conversationId}`).emit('user_online', {
              userId: socket.userId,
              conversationId
            })
            
            socket.emit('joined_conversation', { conversationId })
          } else {
            socket.emit('error', { message: 'Unauthorized access to conversation' })
          }
        } catch (error) {
          console.error('Join conversation error:', error)
          socket.emit('error', { message: 'Failed to join conversation' })
        }
      })

      // Konuşmadan ayrılma
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`)
        
        // Diğer katılımcılara kullanıcının offline olduğunu bildir
        socket.to(`conversation:${conversationId}`).emit('user_offline', {
          userId: socket.userId,
          conversationId
        })
        
        console.log(`User ${socket.userId} left conversation ${conversationId}`)
      })

      // Mesaj gönderme (real-time broadcast)
      socket.on('send_message', async (data: {
        conversationId: string
        content: string
        receiverId: string
        tempId?: string
      }) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' })
            return
          }

          const { conversationId, content, receiverId, tempId } = data

          // Mesajı veritabanına kaydet
          const message = await prisma.message.create({
            data: {
              content,
              userId: socket.userId,
              conversationId
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

          // Konuşmanın son güncelleme zamanını güncelle
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
          })

          // Mesajı konuşmadaki tüm katılımcılara gönder
          const messageData = {
            id: message.id,
            content: message.content,
            senderId: message.userId,
            conversationId: message.conversationId,
            createdAt: message.createdAt.toISOString(),
            isRead: false,
            sender: message.user,
            tempId // Geçici ID'yi geri gönder
          }

          io.to(`conversation:${conversationId}`).emit('new_message', messageData)

          // Alıcıya bildirim gönder (eğer online ise)
          const receiverSocketId = connectedUsers.get(receiverId)
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('notification', {
              type: 'new_message',
              message: `${message.user.name} size bir mesaj gönderdi`,
              conversationId,
              senderId: socket.userId
            })
          }

          console.log(`Message sent in conversation ${conversationId}`)
        } catch (error) {
          console.error('Send message error:', error)
          socket.emit('message_error', { 
            message: 'Failed to send message',
            tempId: data.tempId 
          })
        }
      })

      // Yazıyor durumu
      socket.on('typing_start', (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
          userId: socket.userId,
          conversationId: data.conversationId,
          isTyping: true
        })
      })

      socket.on('typing_stop', (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
          userId: socket.userId,
          conversationId: data.conversationId,
          isTyping: false
        })
      })

      // Mesaj okundu işaretleme
      socket.on('mark_messages_read', async (data: { conversationId: string }) => {
        try {
          if (!socket.userId) return

          const updatedMessages = await prisma.message.updateMany({
            where: {
              conversationId: data.conversationId,
              userId: { not: socket.userId },
              isRead: false
            },
            data: {
              isRead: true
            }
          })

          if (updatedMessages.count > 0) {
            // Gönderene mesajların okunduğunu bildir
            socket.to(`conversation:${data.conversationId}`).emit('messages_read', {
              conversationId: data.conversationId,
              readerId: socket.userId
            })
          }
        } catch (error) {
          console.error('Mark messages read error:', error)
        }
      })

      // Online durumu güncelleme
      socket.on('update_online_status', (isOnline: boolean) => {
        if (socket.userId) {
          socket.broadcast.emit('user_status_changed', {
            userId: socket.userId,
            isOnline
          })
        }
      })

      // Bağlantı koptuğunda
      socket.on('disconnect', () => {
        if (socket.userId) {
          connectedUsers.delete(socket.userId)
          
          // Tüm konuşmalara offline durumunu bildir
          socket.broadcast.emit('user_offline', {
            userId: socket.userId
          })
          
          console.log(`User ${socket.userId} disconnected`)
        }
        
        console.log('Client disconnected:', socket.id)
      })

      // Hata yönetimi
      socket.on('error', (error) => {
        console.error('Socket error:', error)
      })
    })

    res.socket.server.io = io
  } else {
    console.log('socket.io already running')
  }
  res.end()
}

export default ioHandler

// Socket.io client için tip tanımları
declare module 'socket.io' {
  interface Socket {
    userId?: string
  }
}