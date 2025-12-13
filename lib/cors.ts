import { NextResponse } from 'next/server'

export function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*', // Allow all origins, change to specific domain in production
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
    }
}

export function handleCors(response: NextResponse) {
    const headers = corsHeaders()
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
    })
    return response
}

export function handleOptions() {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(),
    })
}
