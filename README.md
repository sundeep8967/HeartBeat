# HeartBeat

Where Corporate Hearts Meet - A premium dating platform designed exclusively for corporate professionals.

## Features

### 🏢 Corporate-Focused Dating
- **Professional Verification**: All members are verified through their corporate email and LinkedIn profile
- **Smart Matching**: AI-powered matching based on career goals, lifestyle preferences, and values
- **Exclusive Community**: Curated community of ambitious professionals seeking meaningful relationships

### 🔐 Authentication
- **Google Sign-in**: Start with your corporate Google account
- **LinkedIn Integration**: Enhance your profile with professional LinkedIn data
- **Secure Authentication**: NextAuth.js powered secure authentication system

### 💼 Professional Profiles
- **Detailed Professional Information**: Job title, company, industry, experience, salary range
- **Education & Background**: Academic qualifications and professional background
- **Lifestyle & Preferences**: Work-life balance preferences and relationship goals
- **Social Links**: Connect your LinkedIn and Twitter profiles

### ❤️ Smart Matching
- **AI-Powered Algorithm**: Matches based on professional compatibility and shared values
- **Swipe Interface**: Easy-to-use card-based matching system
- **Mutual Matching**: Both users must like each other to connect
- **Advanced Filters**: Filter by industry, location, age range, and more

### 💬 Messaging System
- **Real-time Chat**: Message your matches once connected
- **Secure Messaging**: Only matched users can communicate
- **Rich Media Support**: Share photos and files (coming soon)

### 🎨 Modern UI/UX
- **Liquid Animations**: Smooth, fluid animations throughout the interface
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Dark Mode Support**: Easy on the eyes with theme switching
- **Professional Design**: Clean, modern interface designed for professionals

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Authentication**: NextAuth.js with Google and LinkedIn providers
- **Database**: SQLite with Prisma ORM
- **Backend**: Next.js API Routes
- **Real-time**: Socket.io integration (ready for real-time features)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/sundeep8967/HeartBeat.git
cd HeartBeat
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

5. Set up the database
```bash
npm run db:push
```

6. Run the development server
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite database connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth client ID | Yes |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth client secret | Yes |
| `NEXTAUTH_URL` | URL of your Next.js app | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── matches/       # Matching system endpoints
│   │   ├── messages/      # Messaging endpoints
│   │   └── user/          # User profile endpoints
│   ├── dashboard/         # Main dashboard page
│   ├── messages/          # Messaging interface
│   ├── profile/           # Profile management
│   ├── setup-profile/     # Profile setup flow
│   └── page.tsx          # Landing page
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── utils.ts          # Utility functions
└── prisma/               # Database schema
```

## API Endpoints

### Authentication
- `/api/auth/[...nextauth]` - NextAuth.js authentication
- `/api/auth/providers` - Available authentication providers
- `/api/auth/session` - Current user session

### User Management
- `POST /api/user/profile` - Create/update user profile
- `GET /api/user/profile` - Get user profile

### Matching
- `GET /api/matches/potential` - Get potential matches
- `POST /api/matches/like` - Like a user
- `GET /api/matches/accepted` - Get accepted matches

### Messaging
- `GET /api/messages/[userId]` - Get messages with a user
- `POST /api/messages/send` - Send a message to a user

## Database Schema

The application uses Prisma with SQLite. The main entities are:

- **User**: Professional profiles with corporate and personal information
- **Account**: OAuth account linkage
- **Session**: User sessions
- **Match**: User matching system with like/accept functionality
- **Message**: Real-time messaging between matched users
- **VerificationToken**: Token-based verification system

## Features in Development

- [ ] Real-time messaging with Socket.io
- [ ] Video calling integration
- [ ] Advanced matching algorithms
- [ ] Premium subscription features
- [ ] Mobile app (React Native)
- [ ] Advanced profile verification
- [ ] Company verification system
- [ ] Events and meetups
- [ ] Success stories and testimonials

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Authentication powered by [NextAuth.js](https://next-auth.js/)
- Database managed by [Prisma](https://www.prisma.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**HeartBeat - Where Corporate Hearts Meet**  
*Connecting ambitious professionals who understand your drive*# HeartBeat
