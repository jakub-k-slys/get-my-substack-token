# Get My Substack Token

A Next.js application that helps you retrieve your Substack authentication token through a simplified authentication flow.

## Overview

This application provides a user-friendly interface to obtain your Substack session token (`substack.sid`), which can be used for API integrations, automation scripts, or accessing Substack programmatically.

### Features

- **Email-based authentication** - Sign in using your Substack email
- **Verification code support** - Enter the 6-digit code from your email
- **Two-factor authentication** - Supports optional 2FA with skip functionality
- **Token extraction** - Automatically extracts and displays your session token
- **Error handling** - Clear error messages and debugging information
- **Responsive design** - Works on desktop and mobile devices
- **Dark mode support** - Built-in theme switching

## How It Works

The application proxies Substack's authentication API through Next.js Server Actions to:

1. Send a login email to your Substack account
2. Verify the code from the email
3. Handle optional two-factor authentication
4. Extract the session token from HTTP-only cookies
5. Display the token for you to copy and use

**Important:** Due to browser security (Same-Origin Policy), the app extracts tokens directly from API response headers rather than relying on cookies set for `substack.com`.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm (recommended) or npm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jakub-k-slys/get-my-substack-token.git
cd get-my-substack-token
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
pnpm build
pnpm start
```

## Usage

1. **Enter your email** - Provide the email address associated with your Substack account
2. **Check your inbox** - Substack will send you a verification email
3. **Enter the code** - Input the 6-digit code from the email
4. **Handle 2FA** (if enabled):
   - Enter your 2FA code if you have it enabled
   - Or click "Skip" if you don't use 2FA
5. **Copy your token** - Your session token will be displayed. Click to copy it.

### Using Your Token

Once you have your token, you can use it to make authenticated requests to Substack's API:

```bash
curl -H "Cookie: substack.sid=YOUR_TOKEN_HERE" \
  https://substack.com/api/v1/...
```

## Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **Fonts:** Geist Sans & Geist Mono

## Project Structure

```
├── app/
│   ├── actions/
│   │   └── substack-auth.ts    # Server actions for Substack API
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── substack-token-flow.tsx  # Main authentication flow
│   └── ui/                      # shadcn/ui components
├── lib/
│   └── utils.ts                 # Utility functions
└── public/                      # Static assets
```

## Security Considerations

- **Session tokens are sensitive** - Treat them like passwords
- **Never commit tokens** - Don't store tokens in version control
- **Use HTTPS in production** - Always use secure connections
- **Tokens expire** - Substack session tokens have expiration dates
- **This is for personal use** - Only use this tool with your own Substack account

## Development

### Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Environment

- Development server runs on `http://localhost:3000`
- Hot reload enabled for rapid development
- TypeScript strict mode enabled

## Deployment

The project includes a GitHub Actions workflow for automated deployment to GitHub Pages:

- Triggers on push to `main` branch
- Builds static Next.js site
- Deploys to GitHub Pages

You can also deploy to:
- [Vercel](https://vercel.com) (recommended for Next.js)
- [Netlify](https://netlify.com)
- Any Node.js hosting platform

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This tool is not affiliated with, endorsed by, or sponsored by Substack. It is an independent project created for educational and personal automation purposes. Use at your own risk and in accordance with Substack's Terms of Service.

## Support

If you encounter any issues or have questions:

- Open an [issue](https://github.com/jakub-k-slys/get-my-substack-token/issues)
- Check the console logs for detailed error messages
- Ensure you're using the latest version of the application

---

Built with ❤️ using [Next.js](https://nextjs.org) and [TypeScript](https://www.typescriptlang.org)
