import { createServer, connect, type Socket } from 'node:net';

/** Test-only PostgreSQL wire proxy. All query bytes/results are real and forwarded unchanged,
 * except one completion withheld only after ReadyForQuery confirms an idle, committed backend. */
export async function acknowledgementProxy(target: URL) {
    const sockets = new Set<Socket>();
    let armed: 'auth-save' | 'commit' | undefined;
    let dropped: { operation: string; commandTag: string; backendTransactionStatus: string } | undefined;
    const server = createServer(client => {
        const backend = connect({ host: target.hostname, port: Number(target.port || 5432) });
        sockets.add(client); sockets.add(backend);
        let startup = true, frontend = Buffer.alloc(0), responses = Buffer.alloc(0), sql = '';
        let withholding: typeof armed, completion = '';
        const close = () => { client.destroy(); backend.destroy(); sockets.delete(client); sockets.delete(backend); };
        client.on('error', close); backend.on('error', close);
        client.on('close', close); backend.on('close', close);
        client.on('data', chunk => {
            frontend = Buffer.concat([frontend, chunk]);
            while (frontend.length >= (startup ? 4 : 5)) {
                const length = frontend.readInt32BE(startup ? 0 : 1) + (startup ? 0 : 1);
                if (length < 4 || length > 1048576) { close(); return; }
                if (frontend.length < length) break;
                const packet = frontend.subarray(0, length); frontend = frontend.subarray(length);
                if (startup) { startup = false; continue; }
                const kind = String.fromCharCode(packet[0]!);
                if (kind === 'P') sql = packet.subarray(packet.indexOf(0, 5) + 1).toString('utf8');
                if (armed === 'auth-save' && kind === 'B' && sql.includes('INSERT INTO auth_session') && packet.includes(Buffer.from('"userId"'))) {
                    withholding = armed; armed = undefined;
                }
                if (armed === 'commit' && kind === 'Q' && packet.subarray(5).toString('utf8').replace(/\0$/, '').trim() === 'COMMIT') {
                    withholding = armed; armed = undefined;
                }
            }
            backend.write(chunk);
        });
        backend.on('data', chunk => {
            responses = Buffer.concat([responses, chunk]);
            while (responses.length >= 5) {
                const length = responses.readInt32BE(1) + 1;
                if (length < 5 || length > 1048576) { close(); return; }
                if (responses.length < length) break;
                const packet = responses.subarray(0, length); responses = responses.subarray(length);
                const kind = String.fromCharCode(packet[0]!);
                if (withholding && kind === 'C') completion = packet.subarray(5).toString('utf8').replace(/\0$/, '');
                if (withholding && kind === 'Z') {
                    const idle = String.fromCharCode(packet[5]!);
                    if (idle === 'I' && (withholding === 'commit' ? completion === 'COMMIT' : completion.startsWith('INSERT '))) {
                        dropped = { operation: withholding, commandTag: completion, backendTransactionStatus: idle };
                        close(); return;
                    }
                    // Unexpected database failure is not evidence of a committed operation.
                    close(); return;
                }
                if (!withholding) client.write(packet);
            }
        });
    });
    await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Isolated acknowledgement proxy unavailable.');
    const url = new URL(target); url.hostname = '127.0.0.1'; url.port = String(address.port);
    return {
        url: url.href,
        arm(operation: NonNullable<typeof armed>) { if (armed) throw new Error('Acknowledgement proxy already armed.'); dropped = undefined; armed = operation; },
        dropped: () => dropped,
        async close() { for (const socket of sockets) socket.destroy(); await new Promise<void>(resolve => server.close(() => resolve())); }
    };
}
