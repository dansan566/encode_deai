# Solidity Developer Assistant

A dual-assistant chat interface for Solidity development and security auditing, powered by OpenAI and integrated with Ethereum wallet functionality.

## Features

- **Dual Assistant Interface**: 
  - Developer Assistant for Solidity code development
  - Security Auditor Assistant for code review and vulnerability detection
- **Real-time Code Analysis**: Get instant feedback on your Solidity code
- **Security Auditing**: Receive detailed security assessments of your smart contracts
- **Wallet Integration**: Connect your Ethereum wallet using RainbowKit
- **Code Deployment**: Deploy your verified contracts directly to Ethereum networks
- **Markdown Support**: Code blocks and formatting in chat messages
- **Dark Mode**: Built-in dark mode support

## Prerequisites

- Node.js 18+ and pnpm
- An Ethereum wallet (MetaMask, Rainbow, etc.)
- OpenAI API key
- WalletConnect Project ID

## Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:
```env
OPENAI_API_KEY=your_openai_api_key
```

2. Get a WalletConnect Project ID:
   - Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID
   - Replace `YOUR_PROJECT_ID` in `components/wallet-provider.tsx` with your actual Project ID

## Installation

1. Clone the repository
2. navigate to `solidity-dev` directory
```bash
cd final_project/solidity-dev
```
3. Install dependencies:
```bash
pnpm install
```
4. Start the development server:
```bash
pnpm dev
```

## Usage

1. **Connect Your Wallet**:
   - Click the "Connect Wallet" button in the top right
   - Choose your preferred wallet provider
   - Approve the connection request

2. **Developer Assistant**:
   - Write or paste your Solidity code
   - Get instant feedback and suggestions
   - Receive code improvements and best practices

3. **Security Auditor**:
   - Submit your code for security review
   - Get detailed vulnerability analysis
   - Receive recommendations for security improvements

4. **Deploy Contracts**:
   - After getting your code reviewed
   - Click the "Deploy" button
   - Confirm the transaction in your wallet
   - View the deployed contract address

## Project Structure

```
solidity-dev/
├── app/
│   ├── api/              # API routes for OpenAI integration
│   │   └── chat/        # Chat API endpoints
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   │   └── openai.ts    # OpenAI API utilities
│   └── page.tsx         # Main application page
├── components/
│   ├── chat-message.tsx # Chat message component
│   ├── code-editor.tsx  # Code editor component
│   ├── deploy-contract.tsx # Contract deployment component
│   ├── theme-provider.tsx # Theme management
│   └── wallet-provider.tsx # Wallet integration
└── public/              # Static assets
```

## Import Paths

The project uses Next.js's built-in path aliases. Make sure your `tsconfig.json` includes the following path configuration:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This allows you to use imports like `@/lib/openai` which will resolve to `app/lib/openai.ts`.

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- OpenAI API
- RainbowKit
- wagmi
- shadcn/ui
- Monaco Editor
- React Markdown

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT models
- Next.js team for the framework
- Shadcn UI for the component library 