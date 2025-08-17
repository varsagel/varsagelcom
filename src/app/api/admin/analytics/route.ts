import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserIdFromToken } from '@/lib/auth';

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  'admin@varsagel.com',
  'moderator@varsagel.com'
];

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request.headers);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true }
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get overview stats
    const [totalUsers, totalListings, totalOffers, totalReviews] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.offer.count(),
      prisma.review.count()
    ]);

    // Get growth stats (compare with previous period)
    const previousStartDate = new Date(startDate);
    const periodDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    previousStartDate.setDate(startDate.getDate() - periodDays);

    const [currentPeriodUsers, previousPeriodUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      })
    ]);

    const [currentPeriodListings, previousPeriodListings] = await Promise.all([
      prisma.listing.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        }
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      })
    ]);

    const [currentPeriodOffers, previousPeriodOffers] = await Promise.all([
      prisma.offer.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        }
      }),
      prisma.offer.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      })
    ]);

    const [currentPeriodReviews, previousPeriodReviews] = await Promise.all([
      prisma.review.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        }
      }),
      prisma.review.count({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      })
    ]);

    // Calculate growth percentages
    const userGrowth = previousPeriodUsers > 0 ? ((currentPeriodUsers - previousPeriodUsers) / previousPeriodUsers) * 100 : 0;
    const listingGrowth = previousPeriodListings > 0 ? ((currentPeriodListings - previousPeriodListings) / previousPeriodListings) * 100 : 0;
    const offerGrowth = previousPeriodOffers > 0 ? ((currentPeriodOffers - previousPeriodOffers) / previousPeriodOffers) * 100 : 0;
    const reviewGrowth = previousPeriodReviews > 0 ? ((currentPeriodReviews - previousPeriodReviews) / previousPeriodReviews) * 100 : 0;

    // Get active users (users who created content within the time range)
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          {
            listings: {
              some: {
                createdAt: {
                  gte: startDate,
                  lte: now
                }
              }
            }
          },
          {
            offers: {
              some: {
                createdAt: {
                  gte: startDate,
                  lte: now
                }
              }
            }
          }
        ]
      }
    });

    // Generate daily user stats
    const userStats = {
      daily: await generateDailyUserStats(startDate, now),
      monthly: await generateMonthlyUserStats(startDate, now),
      demographics: await generateUserDemographics()
    };

    // Generate listing stats
    const listingStats = {
      daily: await generateDailyListingStats(startDate, now),
      monthly: await generateMonthlyListingStats(startDate, now),
      categories: await generateListingCategories(),
      priceRanges: await generatePriceRanges()
    };

    // Generate offer stats
    const offerStats = {
      daily: await generateDailyOfferStats(startDate, now),
      monthly: await generateMonthlyOfferStats(startDate, now),
      statusDistribution: await generateOfferStatusDistribution()
    };

    // Generate review stats
    const reviewStats = {
      daily: await generateDailyReviewStats(startDate, now),
      monthly: await generateMonthlyReviewStats(startDate, now),
      ratingDistribution: await generateRatingDistribution()
    };

    // Generate revenue stats (mock data for now)
    const revenueStats = {
      daily: generateMockRevenueStats(startDate, now, 'daily'),
      monthly: generateMockRevenueStats(startDate, now, 'monthly'),
      sources: [
        { source: 'Premium Listings', amount: 15000, percentage: 45 },
        { source: 'Featured Ads', amount: 10000, percentage: 30 },
        { source: 'Commission', amount: 8000, percentage: 25 }
      ]
    };

    const overview = {
      totalUsers,
      totalListings,
      totalOffers,
      totalReviews,
      totalRevenue: 33000, // Mock data
      activeUsers,
      userGrowth: Math.round(userGrowth * 100) / 100,
      listingGrowth: Math.round(listingGrowth * 100) / 100,
      offerGrowth: Math.round(offerGrowth * 100) / 100,
      reviewGrowth: Math.round(reviewGrowth * 100) / 100
    };

    return NextResponse.json({
      overview,
      userStats,
      listingStats,
      offerStats,
      reviewStats,
      revenueStats
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function generateDailyUserStats(startDate: Date, endDate: Date) {
  const stats = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    
    const [totalUsers, newUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            lt: nextDate
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          }
        }
      })
    ]);
    
    stats.push({
      date: currentDate.toISOString().split('T')[0],
      users: totalUsers,
      newUsers
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return stats;
}

async function generateMonthlyUserStats(startDate: Date, endDate: Date) {
  // Simplified monthly stats - you can enhance this
  const stats = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const [totalUsers, newUsers] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            lt: monthEnd
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      })
    ]);
    
    stats.unshift({
      month: months[monthStart.getMonth()],
      users: totalUsers,
      newUsers
    });
  }
  
  return stats;
}

async function generateUserDemographics() {
  // Mock demographics data - you can enhance this with real user data
  return [
    { name: '18-25', value: 25, color: '#0088FE' },
    { name: '26-35', value: 35, color: '#00C49F' },
    { name: '36-45', value: 25, color: '#FFBB28' },
    { name: '46+', value: 15, color: '#FF8042' }
  ];
}

async function generateDailyListingStats(startDate: Date, endDate: Date) {
  const stats = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    
    const [listings, approved, pending] = await Promise.all([
      prisma.listing.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          }
        }
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          },
          status: 'APPROVED'
        }
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          },
          status: 'PENDING'
        }
      })
    ]);
    
    stats.push({
      date: currentDate.toISOString().split('T')[0],
      listings,
      approved,
      pending
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return stats;
}

async function generateMonthlyListingStats(startDate: Date, endDate: Date) {
  // Similar to monthly user stats
  const stats = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const [listings, approved, pending] = await Promise.all([
      prisma.listing.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          },
          status: 'APPROVED'
        }
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          },
          status: 'PENDING'
        }
      })
    ]);
    
    stats.unshift({
      month: months[monthStart.getMonth()],
      listings,
      approved,
      pending
    });
  }
  
  return stats;
}

async function generateListingCategories() {
  const categories = await prisma.listing.groupBy({
    by: ['category'],
    _count: {
      id: true
    }
  });
  
  const total = categories.reduce((sum, cat) => sum + cat._count.id, 0);
  
  return categories.map(cat => ({
    category: cat.category,
    count: cat._count.id,
    percentage: Math.round((cat._count.id / total) * 100)
  }));
}

async function generatePriceRanges() {
  // Mock price range data - you can enhance this with real data
  return [
    { range: '0-1000', count: 45 },
    { range: '1000-5000', count: 78 },
    { range: '5000-10000', count: 32 },
    { range: '10000-50000', count: 23 },
    { range: '50000+', count: 12 }
  ];
}

async function generateDailyOfferStats(startDate: Date, endDate: Date) {
  const stats = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    
    const [offers, accepted, rejected] = await Promise.all([
      prisma.offer.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          }
        }
      }),
      prisma.offer.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          },
          status: 'ACCEPTED'
        }
      }),
      prisma.offer.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          },
          status: 'REJECTED'
        }
      })
    ]);
    
    stats.push({
      date: currentDate.toISOString().split('T')[0],
      offers,
      accepted,
      rejected
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return stats;
}

async function generateMonthlyOfferStats(startDate: Date, endDate: Date) {
  // Similar implementation to other monthly stats
  const stats = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const [offers, accepted, rejected] = await Promise.all([
      prisma.offer.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      }),
      prisma.offer.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          },
          status: 'ACCEPTED'
        }
      }),
      prisma.offer.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          },
          status: 'REJECTED'
        }
      })
    ]);
    
    stats.unshift({
      month: months[monthStart.getMonth()],
      offers,
      accepted,
      rejected
    });
  }
  
  return stats;
}

async function generateOfferStatusDistribution() {
  const statuses = await prisma.offer.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });
  
  const colors = {
    'PENDING': '#FFBB28',
    'ACCEPTED': '#00C49F',
    'REJECTED': '#FF8042',
    'COMPLETED': '#0088FE',
    'CANCELLED': '#8884D8'
  };
  
  return statuses.map(status => ({
    status: status.status,
    count: status._count.id,
    color: colors[status.status as keyof typeof colors] || '#8884D8'
  }));
}

async function generateDailyReviewStats(startDate: Date, endDate: Date) {
  const stats = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    
    const [reviews, avgRating] = await Promise.all([
      prisma.review.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          }
        }
      }),
      prisma.review.aggregate({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          }
        },
        _avg: {
          rating: true
        }
      })
    ]);
    
    stats.push({
      date: currentDate.toISOString().split('T')[0],
      reviews,
      averageRating: avgRating._avg.rating || 0
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return stats;
}

async function generateMonthlyReviewStats(startDate: Date, endDate: Date) {
  // Similar implementation
  const stats = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    const [reviews, avgRating] = await Promise.all([
      prisma.review.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      }),
      prisma.review.aggregate({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        },
        _avg: {
          rating: true
        }
      })
    ]);
    
    stats.unshift({
      month: months[monthStart.getMonth()],
      reviews,
      averageRating: avgRating._avg.rating || 0
    });
  }
  
  return stats;
}

async function generateRatingDistribution() {
  const ratings = await prisma.review.groupBy({
    by: ['rating'],
    _count: {
      id: true
    },
    orderBy: {
      rating: 'asc'
    }
  });
  
  return ratings.map(rating => ({
    rating: rating.rating,
    count: rating._count.id
  }));
}

function generateMockRevenueStats(startDate: Date, endDate: Date, type: 'daily' | 'monthly') {
  const stats = [];
  
  if (type === 'daily') {
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      stats.push({
        date: currentDate.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 1000) + 500,
        transactions: Math.floor(Math.random() * 20) + 5
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    months.forEach(month => {
      stats.push({
        month,
        revenue: Math.floor(Math.random() * 10000) + 5000,
        transactions: Math.floor(Math.random() * 200) + 100
      });
    });
  }
  
  return stats;
}