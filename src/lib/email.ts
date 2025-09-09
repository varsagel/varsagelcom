import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// E-posta şablonları
export const emailTemplates = {
  newMessage: {
    subject: 'Yeni Mesajınız Var - VarsaGel',
    html: (data: { senderName: string; message: string; listingTitle?: string; actionUrl: string }) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yeni Mesajınız Var</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VarsaGel</h1>
            <p>Yeni Mesajınız Var</p>
          </div>
          <div class="content">
            <h2>Merhaba!</h2>
            <p><strong>${data.senderName}</strong> size bir mesaj gönderdi.</p>
            ${data.listingTitle ? `<p><strong>İlan:</strong> ${data.listingTitle}</p>` : ''}
            <div class="message-box">
              <p><strong>Mesaj:</strong></p>
              <p>${data.message}</p>
            </div>
            <a href="${data.actionUrl}" class="button">Mesajı Görüntüle</a>
            <p>Bu mesajı VarsaGel platformunda görüntüleyebilir ve yanıtlayabilirsiniz.</p>
          </div>
          <div class="footer">
            <p>Bu e-posta VarsaGel tarafından otomatik olarak gönderilmiştir.</p>
            <p>Eğer bu e-postayı almak istemiyorsanız, hesap ayarlarınızdan bildirim tercihlerinizi değiştirebilirsiniz.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  newOffer: {
    subject: 'İlanınıza Yeni Teklif - VarsaGel',
    html: (data: { listingTitle: string; offerAmount: number; buyerName: string; actionUrl: string }) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Yeni Teklif Aldınız</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .offer-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VarsaGel</h1>
            <p>Yeni Teklif Aldınız!</p>
          </div>
          <div class="content">
            <h2>Harika Haber!</h2>
            <p>İlanınıza yeni bir teklif geldi.</p>
            <div class="offer-box">
              <h3>${data.listingTitle}</h3>
              <p><strong>Teklif Veren:</strong> ${data.buyerName}</p>
              <p><strong>Teklif Miktarı:</strong> ${data.offerAmount.toLocaleString('tr-TR')} ₺</p>
            </div>
            <a href="${data.actionUrl}" class="button">Teklifi Görüntüle</a>
            <p>Teklifi kabul edebilir, reddedebilir veya karşı teklif yapabilirsiniz.</p>
          </div>
          <div class="footer">
            <p>Bu e-posta VarsaGel tarafından otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  offerAccepted: {
    subject: 'Teklifiniz Kabul Edildi - VarsaGel',
    html: (data: { listingTitle: string; offerAmount: number; sellerName: string; actionUrl: string }) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teklifiniz Kabul Edildi</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .success-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a; }
          .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VarsaGel</h1>
            <p>🎉 Teklifiniz Kabul Edildi!</p>
          </div>
          <div class="content">
            <h2>Tebrikler!</h2>
            <p>Teklifiniz kabul edildi. Artık satıcı ile iletişime geçebilirsiniz.</p>
            <div class="success-box">
              <h3>${data.listingTitle}</h3>
              <p><strong>Satıcı:</strong> ${data.sellerName}</p>
              <p><strong>Kabul Edilen Teklif:</strong> ${data.offerAmount.toLocaleString('tr-TR')} ₺</p>
            </div>
            <a href="${data.actionUrl}" class="button">Detayları Görüntüle</a>
            <p>Satın alma işlemini tamamlamak için satıcı ile iletişime geçin.</p>
          </div>
          <div class="footer">
            <p>Bu e-posta VarsaGel tarafından otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  offerRejected: {
    subject: 'Teklifiniz Hakkında Güncelleme - VarsaGel',
    html: (data: { listingTitle: string; offerAmount: number; sellerName: string; actionUrl: string }) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Teklif Güncelleme</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VarsaGel</h1>
            <p>Teklif Güncelleme</p>
          </div>
          <div class="content">
            <h2>Merhaba!</h2>
            <p>Maalesef teklifiniz kabul edilmedi, ancak yeni bir teklif yapabilirsiniz.</p>
            <div class="info-box">
              <h3>${data.listingTitle}</h3>
              <p><strong>Satıcı:</strong> ${data.sellerName}</p>
              <p><strong>Reddedilen Teklif:</strong> ${data.offerAmount.toLocaleString('tr-TR')} ₺</p>
            </div>
            <a href="${data.actionUrl}" class="button">Yeni Teklif Yap</a>
            <p>Farklı bir teklif miktarı ile tekrar deneyebilirsiniz.</p>
          </div>
          <div class="footer">
            <p>Bu e-posta VarsaGel tarafından otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  listingExpired: {
    subject: 'İlanınızın Süresi Doldu - VarsaGel',
    html: (data: { listingTitle: string; actionUrl: string }) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>İlan Süresi Doldu</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .warning-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VarsaGel</h1>
            <p>İlan Süresi Doldu</p>
          </div>
          <div class="content">
            <h2>Merhaba!</h2>
            <p>İlanınızın yayın süresi dolmuştur.</p>
            <div class="warning-box">
              <h3>${data.listingTitle}</h3>
              <p>Bu ilan artık aktif değildir ve kullanıcılar tarafından görüntülenemez.</p>
            </div>
            <a href="${data.actionUrl}" class="button">İlanı Yenile</a>
            <p>İlanınızı yeniden yayınlamak için yukarıdaki butona tıklayın.</p>
          </div>
          <div class="footer">
            <p>Bu e-posta VarsaGel tarafından otomatik olarak gönderilmiştir.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// E-posta transporter yapılandırması
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

// E-posta gönderme fonksiyonu
export const sendEmail = async ({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html?: string
  text?: string
}) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"VarsaGel" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('E-posta gönderildi:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('E-posta gönderme hatası:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Bildirim e-postası gönderme fonksiyonları
export const sendNotificationEmail = {
  newMessage: async ({
    to,
    senderName,
    message,
    listingTitle,
    actionUrl
  }: {
    to: string
    senderName: string
    message: string
    listingTitle?: string
    actionUrl: string
  }) => {
    return sendEmail({
      to,
      subject: emailTemplates.newMessage.subject,
      html: emailTemplates.newMessage.html({
        senderName,
        message,
        listingTitle,
        actionUrl
      })
    })
  },

  newOffer: async ({
    to,
    listingTitle,
    offerAmount,
    buyerName,
    actionUrl
  }: {
    to: string
    listingTitle: string
    offerAmount: number
    buyerName: string
    actionUrl: string
  }) => {
    return sendEmail({
      to,
      subject: emailTemplates.newOffer.subject,
      html: emailTemplates.newOffer.html({
        listingTitle,
        offerAmount,
        buyerName,
        actionUrl
      })
    })
  },

  offerAccepted: async ({
    to,
    listingTitle,
    offerAmount,
    sellerName,
    actionUrl
  }: {
    to: string
    listingTitle: string
    offerAmount: number
    sellerName: string
    actionUrl: string
  }) => {
    return sendEmail({
      to,
      subject: emailTemplates.offerAccepted.subject,
      html: emailTemplates.offerAccepted.html({
        listingTitle,
        offerAmount,
        sellerName,
        actionUrl
      })
    })
  },

  offerRejected: async ({
    to,
    listingTitle,
    offerAmount,
    sellerName,
    actionUrl
  }: {
    to: string
    listingTitle: string
    offerAmount: number
    sellerName: string
    actionUrl: string
  }) => {
    return sendEmail({
      to,
      subject: emailTemplates.offerRejected.subject,
      html: emailTemplates.offerRejected.html({
        listingTitle,
        offerAmount,
        sellerName,
        actionUrl
      })
    })
  },

  listingExpired: async ({
    to,
    listingTitle,
    actionUrl
  }: {
    to: string
    listingTitle: string
    actionUrl: string
  }) => {
    return sendEmail({
      to,
      subject: emailTemplates.listingExpired.subject,
      html: emailTemplates.listingExpired.html({
        listingTitle,
        actionUrl
      })
    })
  }
}

// Bildirim oluşturma ve e-posta gönderme helper fonksiyonu
export const createNotificationWithEmail = async ({
  userId,
  type,
  title,
  message,
  relatedId,
  relatedType,
  actionUrl,
  emailData
}: {
  userId: string
  type: 'NEW_MESSAGE' | 'NEW_OFFER' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'LISTING_EXPIRING' | 'SYSTEM'
  title: string
  message: string
  relatedId?: string
  relatedType?: 'LISTING' | 'OFFER' | 'MESSAGE' | 'USER'
  actionUrl?: string
  emailData?: {
    userEmail: string
    emailType: keyof typeof sendNotificationEmail
    emailParams: Record<string, unknown>
  }
}) => {
  try {
    // Veritabanına bildirim kaydet
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: {
          relatedId,
          relatedType,
          actionUrl
        }
      }
    })

    // E-posta gönder (eğer belirtilmişse)
    if (emailData) {
      const emailFunction = sendNotificationEmail[emailData.emailType]
      if (emailFunction) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (emailFunction as any)({
          to: emailData.userEmail,
          ...emailData.emailParams
        })
      }
    }

    return { success: true, notification }
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}