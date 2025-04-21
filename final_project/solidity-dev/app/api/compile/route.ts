import { NextRequest, NextResponse } from 'next/server'
const solc = require('solc');

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing Solidity code' }, { status: 400 })
    }

    const input = {
      language: 'Solidity',
      sources: {
        'Contract.sol': { content: code },
      },
      settings: {
        outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
      },
    }
    const output = JSON.parse(solc.compile(JSON.stringify(input)))
    if (output.errors) {
      const errorMsgs = output.errors.filter((e: any) => e.severity === 'error')
      if (errorMsgs.length > 0) {
        return NextResponse.json({ success: false, errors: errorMsgs.map((e: any) => e.formattedMessage) }, { status: 200 })
      }
    }
    return NextResponse.json({ success: true, output }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
