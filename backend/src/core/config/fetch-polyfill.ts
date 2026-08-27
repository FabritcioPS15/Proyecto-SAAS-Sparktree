// backend/src/core/config/fetch-polyfill.ts
// Polyfill agresivo que fuerza IPv4 a nivel de DNS y HTTP

import dns from 'dns';
import { lookup as originalLookup } from 'dns';
import { Agent as HttpsAgent } from 'https';
import { Agent as HttpAgent } from 'http';

// ============================================
// 1. INTERCEPTAR dns.lookup PARA FORZAR IPv4
// ============================================
const originalDnsLookup = dns.lookup;

// @ts-ignore - Sobrescribimos dns.lookup
dns.lookup = function(hostname: string, options: any, callback: any) {
    // Si no hay callback, ajustar argumentos
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    
    // Forzar family: 4 (IPv4) si no se especifica otra
    const opts = options || {};
    if (!opts.family) {
        opts.family = 4;
    }
    
    // Si específicamente piden IPv6 (family: 6), devolver error
    if (opts.family === 6) {
        const error: any = new Error(`getaddrinfo ENOTFOUND ${hostname}`);
        error.code = 'ENOTFOUND';
        error.hostname = hostname;
        return callback(error);
    }
    
    // Llamar al lookup original forzado a IPv4
    return originalDnsLookup.call(dns, hostname, { ...opts, family: 4 }, callback);
};

// También parchear lookupService por si acaso
dns.setDefaultResultOrder('ipv4first');

// ============================================
// 2. AGENTES HTTP QUE FUERZAN IPv4
// ============================================
export const ipv4HttpsAgent = new HttpsAgent({
    family: 4,
    keepAlive: true,
    lookup: (hostname, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        return originalLookup(hostname, { ...options, family: 4 }, callback);
    }
});

export const ipv4HttpAgent = new HttpAgent({
    family: 4,
    keepAlive: true,
    lookup: (hostname, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        return originalLookup(hostname, { ...options, family: 4 }, callback);
    }
});

// ============================================
// 3. SOBREESCRIBIR FETCH GLOBAL
// ============================================
const originalFetch = globalThis.fetch;

globalThis.fetch = (input: any, init: any = {}) => {
    const url = typeof input === 'string' ? input : input.url || input.toString();
    
    // Inyectar agente IPv4 si no hay uno ya configurado
    if (!init.agent) {
        init.agent = url.startsWith('https:') ? ipv4HttpsAgent : ipv4HttpAgent;
    }
    
    return originalFetch(input, init);
};

console.log('[FetchPolyfill] ✅ DNS.lookup interceptado, IPv4 FORZADO globalmente');
console.log('[FetchPolyfill] ✅ Agentes HTTP IPv4 configurados');
console.log('[FetchPolyfill] ✅ global.fetch sobreescrito');