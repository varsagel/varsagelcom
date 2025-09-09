import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export interface SocketUser {
  id: string
  name: string
  email: string
}

export interface SocketMessage {
  id: string
  content: string
  senderId: string
  conversationId: string
  createdAt: string
  sender: SocketUser
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new ServerIO(res.socket.server)
    res.socket.server.io = io

    // Kullanıcı bağlantı yönetimi
    const connectedUsers = new Map<string, string>() // userId -> socketId

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id)

      // Kullanıcı kimlik doğrulama
      socket.on('authenticate', async (token: string) => {
        try {
          // Token'dan session bilgisini al
          const session = await getServerSession(authOptions)
          
          if (session?.user?.id) {
            socket.userId = session.user.id
            connectedUsers.set(session.user.id, socket.id)
            
            // Kullanıcıyı kendi odasına ekle
            socket.join(`user:${session.user.id}`)
            
            console.log(`User ${session.user.id} authenticated and joined room`)
            
            // Kullanıcının aktif konuşmalarına katıl
            const conversations = await prisma.conversation.findMany({
              where: {
                participants: {
                  some: {
                    id: session.user.id
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
            
            socket.emit('authenticated', { success: true })
          } else {
            socket.emit('authentication_error', { message: 'Invalid session' })
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
                  id: socket.userId
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

      // Mesaj gönderme
      socket.on('send_message', async (data: {
        conversationId: string
        content: string
        receiverId: string
      }) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' })
            return
          }

          const { conversationId, content, receiverId } = data

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
          io.to(`conversation:${conversationId}`).emit('new_message', {
            id: message.id,
            content: message.content,
            senderId: message.userId,
            conversationId: message.conversationId,
            createdAt: message.createdAt.toISOString(),
            sender: message.user
          })

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
          socket.emit('error', { message: 'Failed to send message' })
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

          await prisma.message.updateMany({
            where: {
              conversationId: data.conversationId,
              userId: { not: socket.userId },
              isRead: false
            },
            data: {
              isRead: true
            }
          })

          // Gönderene mesajların okunduğunu bildir
          socket.to(`conversation:${data.conversationId}`).emit('messages_read', {
            conversationId: data.conversationId,
            readerId: socket.userId
          })
        } catch (error) {
          console.error('Mark messages read error:', error)
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
        }
        
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server)
    res.socket.server.io = io
  }
}

export default SocketHandler

// Socket.io client için tip tanımları
declare module 'socket.io' {
  interface Socket {
    userId?: string
  }
}