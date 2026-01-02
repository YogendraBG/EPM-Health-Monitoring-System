
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure this runs every time

export async function GET() {
    try {
        // Fetch all services
        const services = await prisma.service.findMany({
            include: { environment: true }
        });

        if (services.length === 0) {
            return NextResponse.json({ success: true, results: [], message: "No services configured" });
        }

        const results = [];

        // Run checks in parallel with a limit might be better for 75+ services, 
        // but for now sequential or simple Promise.all is fine.
        // Let's use Promise.all for speed.

        const checks = services.map(async (service: any) => {
            const startTime = Date.now();
            let status = "DOWN";
            let error = null;
            let latency = 0;

            try {
                const headers: HeadersInit = {}
                const token = service.token || service.environment.token

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`
                }

                const res = await fetch(service.url, {
                    method: 'GET',
                    headers,
                    cache: 'no-store',
                    signal: AbortSignal.timeout(5000) // 5s timeout
                });

                if (res.ok) {
                    status = "UP";
                } else {
                    status = "DOWN";
                    error = `${res.status} ${res.statusText}`;
                }
            } catch (e: any) {
                status = "DOWN";
                if (e.name === 'TimeoutError') {
                    error = "Timeout (5s limit)";
                } else if (e.cause?.code === 'ENOTFOUND') {
                    error = "DNS/Network Error";
                } else {
                    error = e.message || "Unknown Error";
                }
            } finally {
                latency = Date.now() - startTime;
            }

            // Log result
            await prisma.healthLog.create({
                data: {
                    serviceId: service.id,
                    status,
                    error,
                    latency
                }
            });

            return {
                env: service.environment.name,
                service: service.name,
                status,
                latency
            };
        });

        const checkResults = await Promise.all(checks);

        return NextResponse.json({ success: true, results: checkResults });
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json({ success: false, error: 'Failed to run health checks' }, { status: 500 });
    }
}
