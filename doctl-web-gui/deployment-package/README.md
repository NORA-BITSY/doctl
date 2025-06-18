This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/route.ts`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# DigitalOcean Control Panel - doctl Web GUI

A comprehensive web interface for managing DigitalOcean resources through the doctl CLI.

## Features

- **Secure Authentication** - API token-based authentication with local storage
- **Complete Resource Management** - Manage all DO resources through intuitive web interface
- **Real-time CLI Integration** - Execute doctl commands through backend API
- **Interactive Terminal** - Built-in terminal for direct CLI access
- **Modern UI** - Dark/light mode support with responsive design
- **Dashboard Overview** - Resource statistics and quick actions

## Prerequisites

- Node.js 18+ and npm
- doctl CLI installed and accessible in PATH
- Valid DigitalOcean API token

## Installation

1. **Install doctl CLI** (if not already installed):
   ```bash
   # macOS
   brew install doctl
   
   # Or download from: https://github.com/digitalocean/doctl/releases
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

## Usage

1. **Get your API token** from DigitalOcean:
   - Go to https://cloud.digitalocean.com/account/api/tokens
   - Generate a new personal access token
   - Copy the token

2. **Login to the web interface**:
   - Open http://localhost:3000
   - Paste your API token
   - Click "Connect Account"

3. **Navigate the interface**:
   - **Dashboard** - Overview of all resources with charts and statistics
   - **Droplets** - Manage virtual private servers with bulk actions
   - **Terminal** - Execute doctl commands directly with history
   - **Other Services** - Domains, Firewalls, Databases, Kubernetes, etc.

## Available Views

### Implemented
- **Dashboard Overview** - Resource statistics, charts, and quick actions
- **Droplets Management** - Full droplet lifecycle management
- **Terminal Interface** - Interactive doctl command execution

### Coming Soon
- Domain & DNS management
- Firewall configuration
- Database management
- Kubernetes cluster management
- App Platform deployment
- Container Registry management
- VPC and networking
- Load balancers
- Storage volumes and snapshots
- SSL certificates
- CDN configuration
- Monitoring and alerting
- Project organization
- Billing and usage

## Security

- API tokens are stored locally in browser storage
- No tokens are sent to external servers
- All API calls go directly through doctl CLI
- Secure token validation on login

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

- **Frontend**: Next.js 14 with React 18
- **UI Components**: Custom components with Tailwind CSS
- **Charts**: Recharts for data visualization
- **CLI Integration**: Node.js child processes executing doctl
- **State Management**: React hooks and context
- **Styling**: Tailwind CSS with dark mode support

## API Routes

- `POST /api/auth/validate` - Validate API token
- `POST /api/doctl` - Execute doctl commands

## Troubleshooting

### doctl not found
Ensure doctl is installed and in your PATH:
```bash
which doctl
doctl version
```

### API token issues
- Ensure token has proper permissions
- Check token hasn't expired
- Verify token format (starts with `dop_v1_`)

### Build issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
