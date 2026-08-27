import axios from 'axios';
import { supabase } from '../../core/config/supabase';

interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface AIResponse {
    response: string;
    intent?: string;
    suggestedActions?: Array<{
        type: 'show_product' | 'create_quote' | 'check_stock' | 'escalate';
        payload?: any;
    }>;
    products?: Array<{ id: string; name: string; sku: string }>;
}

class AIService {
    private vllmEndpoint: string;
    private modelName: string;
    private isWarmingUp: boolean = false;

    constructor() {
        this.vllmEndpoint = process.env.VLLM_ENDPOINT || 'http://host.docker.internal:8000';
        this.modelName = process.env.VLLM_MODEL || '/home/user/local-ai/models/Qwen2.5-Coder-14B-Instruct-AWQ';

        this.warmupModel();
    }
 private async warmupModel() {
        if (this.isWarmingUp) return;
        this.isWarmingUp = true;
        
        try {
            console.log('[AI Service] 🔄 Warming up model...');
            await axios.post(
                `${this.vllmEndpoint}/v1/chat/completions`,
                {
                    model: this.modelName,
                    messages: [{ role: 'user', content: 'Hi' }],
                    max_tokens: 5
                },
                { timeout: 120000 }
            );
            console.log('[AI Service] ✅ Model warmed up successfully');
        } catch (error: any) {
            console.warn('[AI Service] ⚠️ Warmup failed (non-critical):', error.message);
        } finally {
            this.isWarmingUp = false;
        }
    }
    /**
     * Procesa un mensaje del usuario con contexto de negocio
     */
    async processMessage(
        organizationId: string,
        contactId: string,
        conversationId: string,
        userMessage: string
    ): Promise<AIResponse> {
        try {
            // 1. Construir contexto de negocio
            const context = await this.buildBusinessContext(organizationId, contactId, userMessage);
            
            // 2. Construir prompt del sistema
            const systemPrompt = this.buildSystemPrompt(context);
            
            // 3. Obtener historial de conversación reciente
            const history = await this.getConversationHistory(conversationId, 5);
            
            // 4. Construir mensajes
            const messages: AIMessage[] = [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: userMessage }
            ];

            // 5. Llamar a vLLM
            console.log(`[AI Service] Calling vLLM at ${this.vllmEndpoint}/v1/chat/completions`);
            
            const response = await axios.post(
                `${this.vllmEndpoint}/v1/chat/completions`,
                {
                    model: this.modelName,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 512,  // ← Reducir a 512 para respuestas más rápidas
                    top_p: 0.9,
                    frequency_penalty: 0.1,
                    presence_penalty: 0.1
                },
                { 
                    timeout: 180000,  // ← AUMENTAR a 3 minutos
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const aiResponseText = response.data.choices[0].message.content;
            console.log(`[AI Service] Raw response:`, aiResponseText.substring(0, 200));

            // 6. Parsear respuesta (intentar JSON, fallback a texto plano)
            let parsedResponse: AIResponse;
            try {
                parsedResponse = JSON.parse(aiResponseText);
            } catch {
                // Si no es JSON válido, envolver en estructura
                parsedResponse = {
                    response: aiResponseText,
                    intent: 'general'
                };
            }

            // 7. Guardar en historial
            await this.saveConversation(
                organizationId,
                contactId,
                conversationId,
                userMessage,
                parsedResponse
            );

            return parsedResponse;

        } catch (error: any) {
            console.error('[AI Service] Error:', error.message);
            throw new Error(`Error al procesar consulta: ${error.message}`);
        }
    }

    /**
     * Construye el contexto de negocio para el prompt
     */
    private async buildBusinessContext(
        organizationId: string,
        contactId: string,
        query: string
    ) {
        // Buscar productos relevantes (búsqueda simple por nombre)
        const { data: products } = await supabase
            .from('products')
            .select(`
                id,
                sku,
                name,
                description,
                base_price,
                currency,
                stock:stock(quantity)
            `)
            .eq('organization_id', organizationId)
            .eq('is_active', true)
            .limit(20);

        // Obtener cotizaciones recientes del contacto
        const { data: recentQuotes } = await supabase
            .from('quotes')
            .select(`
                id,
                quote_number,
                status,
                total,
                currency,
                created_at,
                items:quote_items(product_name, quantity, unit_price)
            `)
            .eq('organization_id', organizationId)
            .eq('contact_id', contactId)
            .order('created_at', { ascending: false })
            .limit(3);

        // Obtener información del contacto
        const { data: contact } = await supabase
            .from('contacts')
            .select('name, email, phone, tags, custom_attributes')
            .eq('id', contactId)
            .single();

        return {
            products: products || [],
            recentQuotes: recentQuotes || [],
            contact: contact || {}
        };
    }

    /**
     * Construye el prompt del sistema
     */
    private buildSystemPrompt(context: any): string {
        const productsList = context.products.map((p: any) => {
            const stock = p.stock?.[0]?.quantity || 0;
            return `- ${p.name} (SKU: ${p.sku}): ${p.base_price} ${p.currency}. Stock: ${stock} unidades. ${p.description || ''}`;
        }).join('\n');

        const quotesList = context.recentQuotes.map((q: any) =>
            `- Cotización #${q.quote_number || q.id.slice(0,8)}: ${q.total} ${q.currency} (Status: ${q.status}, ${q.items?.length || 0} items)`
        ).join('\n');

        return `Eres un asistente de ventas inteligente y amable para una empresa. Tu objetivo es ayudar a los clientes a encontrar productos, responder consultas sobre precios y disponibilidad, y generar cotizaciones.

## INFORMACIÓN DE NEGOCIO:

### Contacto actual:
- Nombre: ${context.contact.name || 'Cliente'}
- Email: ${context.contact.email || 'No disponible'}
- Teléfono: ${context.contact.phone || 'No disponible'}

### Productos disponibles:
${productsList || 'No hay productos disponibles en este momento'}

### Cotizaciones recientes del cliente:
${quotesList || 'No hay cotizaciones previas'}

## INSTRUCCIONES:
1. Responde SIEMPRE en español
2. Sé amable, profesional y conciso
3. Si te preguntan por un producto, proporciona: nombre, precio y disponibilidad
4. Si no tienes información sobre algo, di "Déjame consultar eso" y sugiere contactar a un agente
5. Para cotizaciones, pregunta qué productos necesitan y en qué cantidad
6. NO inventes precios ni disponibilidad. Usa SOLO la información proporcionada arriba
7. Si el cliente quiere comprar o cotizar, recopila: productos, cantidades, y confirma antes de generar la cotización

## RESPUESTA:
Responde de forma natural y conversacional. No uses formato JSON a menos que te lo pida explícitamente.`;
    }

    /**
     * Obtiene el historial reciente de la conversación
     */
    private async getConversationHistory(
        conversationId: string,
        limit: number = 5
    ): Promise<AIMessage[]> {
        const { data } = await supabase
            .from('messages')
            .select('direction, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (!data || data.length === 0) return [];

        return data.reverse().map(msg => ({
            role: msg.direction === 'inbound' ? 'user' as const : 'assistant' as const,
            content: msg.content
        }));
    }

    /**
     * Guarda la conversación AI para contexto futuro
     */
    private async saveConversation(
        organizationId: string,
        contactId: string,
        conversationId: string,
        userMessage: string,
        aiResponse: AIResponse
    ) {
        try {
            // Verificar si la tabla existe
            await supabase.from('ai_conversations').insert({
                organization_id: organizationId,
                contact_id: contactId,
                conversation_id: conversationId,
                user_message: userMessage,
                ai_response: aiResponse.response,
                intent: aiResponse.intent || 'general',
                context: aiResponse
            });
        } catch (error) {
            // Si la tabla no existe, solo loguear
            console.warn('[AI Service] Could not save to ai_conversations table:', error);
        }
    }
}

export const aiService = new AIService();