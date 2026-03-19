import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

// GET /api/flows
router.get('/', async (req, res) => {
  try {
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const { data: flows, error } = await supabase
      .from('flows')
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flows:', error);
      return res.status(500).json({ error: 'Failed to fetch flows' });
    }

    // Transform the data to match frontend interface
    const transformedFlows = flows?.map(flow => {
      // Fallback: Read from trigger node if columns are missing
      const triggerNode = flow.nodes?.find((n: any) => n.type === 'trigger');
      
      return {
        ...flow,
        lastModified: flow.updated_at,
        assignedTo: flow.assigned_to?.name || 'Sin asignar',
        matchingStrategy: flow.matching_strategy || triggerNode?.data?.matchingStrategy || 'strict',
        reactivationTime: flow.reactivation_time || triggerNode?.data?.reactivationTime || 30
      };
    }) || [];

    res.json(transformedFlows);
  } catch (error) {
    console.error('Error in GET /flows:', error);
    res.status(500).json({ error: 'Failed to fetch flows' });
  }
});

// GET /api/flows/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const { data: flow, error } = await supabase
      .from('flows')
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Transform the data to match frontend interface
    const triggerNode = flow.nodes?.find((n: any) => n.type === 'trigger');
    const transformedFlow = {
      ...flow,
      lastModified: flow.updated_at,
      assignedTo: flow.assigned_to?.name || 'Sin asignar',
      matchingStrategy: flow.matching_strategy || triggerNode?.data?.matchingStrategy || 'strict',
      reactivationTime: flow.reactivation_time || triggerNode?.data?.reactivationTime || 30
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in GET /flows/:id:', error);
    res.status(500).json({ error: 'Failed to fetch flow' });
  }
});

// POST /api/flows
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      description = '', 
      status = 'draft', 
      version = '1.0.0', 
      category = 'other', 
      triggers = [], 
      assigned_to = null, 
      is_default = false, 
      metrics = { conversations: 0, completionRate: 0, avgResponseTime: 0, satisfaction: 0 },
      nodes = [], 
      edges = [] 
    } = req.body;

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const { data: flow, error } = await supabase
      .from('flows')
      .insert({
        organization_id: orgId,
        name,
        description,
        status,
        version,
        category,
        triggers,
        assigned_to,
        is_default,
        metrics,
        nodes,
        edges
      })
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating flow:', error);
      return res.status(500).json({ error: 'Failed to create flow' });
    }

    // Transform the data to match frontend interface
    const triggerNode = flow.nodes?.find((n: any) => n.type === 'trigger');
    const transformedFlow = {
      ...flow,
      lastModified: flow.updated_at,
      assignedTo: flow.assigned_to?.name || 'Sin asignar',
      matchingStrategy: flow.matching_strategy || triggerNode?.data?.matchingStrategy || 'strict',
      reactivationTime: flow.reactivation_time || triggerNode?.data?.reactivationTime || 30
    };

    res.status(201).json(transformedFlow);
  } catch (error) {
    console.error('Error in POST /flows:', error);
    res.status(500).json({ error: 'Failed to create flow' });
  }
});

// PUT /api/flows/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      status, 
      version, 
      category, 
      triggers, 
      assigned_to, 
      is_default, 
      metrics, 
      nodes, 
      edges 
    } = req.body;

    const organization_id = (req as any).organizationId;
    if (!organization_id) return res.status(400).json({ error: 'Organization ID missing' });

    // Prepare update object - only include fields that are present in req.body
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    const fields = [
      'name', 'description', 'status', 'version', 'category', 
      'triggers', 'assigned_to', 'is_default', 'metrics', 'nodes', 'edges'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    console.log(`[Flows API] Updating flow ${id} for org ${organization_id}`);

    const { data: flow, error } = await supabase
      .from('flows')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', organization_id)
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .single();

    if (error) {
      console.error('Error updating flow:', error);
      return res.status(500).json({ 
        error: 'Failed to update flow', 
        details: error.message,
        code: error.code
      });
    }

    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Transform the data to match frontend interface
    const triggerNode = flow.nodes?.find((n: any) => n.type === 'trigger');
    const transformedFlow = {
      ...flow,
      lastModified: flow.updated_at,
      assignedTo: flow.assigned_to?.name || 'Sin asignar',
      matchingStrategy: flow.matching_strategy || triggerNode?.data?.matchingStrategy || 'strict',
      reactivationTime: flow.reactivation_time || triggerNode?.data?.reactivationTime || 30
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in PUT /flows/:id:', error);
    res.status(500).json({ error: 'Failed to update flow' });
  }
});

// DELETE /api/flows/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    const { error } = await supabase
      .from('flows')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error deleting flow:', error);
      return res.status(500).json({ error: 'Failed to delete flow' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /flows/:id:', error);
    res.status(500).json({ error: 'Failed to delete flow' });
  }
});

// POST /api/flows/:id/duplicate
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Get the original flow
    const { data: originalFlow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !originalFlow) {
      return res.status(404).json({ error: 'Original flow not found' });
    }

    // Create duplicate
    const { data: newFlow, error: duplicateError } = await supabase
      .from('flows')
      .insert({
        organization_id: orgId,
        name: `${originalFlow.name} (Copia)`,
        description: originalFlow.description,
        status: 'draft',
        version: '1.0.0',
        category: originalFlow.category,
        triggers: originalFlow.triggers,
        assigned_to: originalFlow.assigned_to,
        is_default: false,
        metrics: { conversations: 0, completionRate: 0, avgResponseTime: 0, satisfaction: 0 },
        nodes: originalFlow.nodes,
        edges: originalFlow.edges
      })
      .select(`
        *,
        assigned_to:users(name, email)
      `)
      .single();

    if (duplicateError) {
      console.error('Error duplicating flow:', duplicateError);
      return res.status(500).json({ error: 'Failed to duplicate flow' });
    }

    // Transform the data to match frontend interface
    const transformedFlow = {
      ...newFlow,
      lastModified: newFlow.updated_at,
      assignedTo: newFlow.assigned_to?.name || 'Sin asignar'
    };

    res.status(201).json(transformedFlow);
  } catch (error) {
    console.error('Error in POST /flows/:id/duplicate:', error);
    res.status(500).json({ error: 'Failed to duplicate flow' });
  }
});

// PUT /api/flows/:id/nodes/:nodeId
router.put('/:id/nodes/:nodeId', async (req, res) => {
  try {
    const { id, nodeId } = req.params;
    const { position, data } = req.body;

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Obtener el flujo actual
    const { data: flow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Actualizar el nodo específico
    const updatedNodes = flow.nodes.map((node: any) => 
      (node as any).id === nodeId 
        ? { ...node, position: position || node.position, data: data || node.data }
        : node
    );

    const { data: updatedFlow, error: updateError } = await supabase
      .from('flows')
      .update({
        nodes: updatedNodes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating node:', updateError);
      return res.status(500).json({ error: 'Failed to update node' });
    }

    const transformedFlow = {
      ...updatedFlow,
      lastModified: updatedFlow.updated_at,
      assignedTo: updatedFlow.assigned_to?.name || 'Sin asignar'
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in PUT /flows/:id/nodes/:nodeId:', error);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// DELETE /api/flows/:id/nodes/:nodeId
router.delete('/:id/nodes/:nodeId', async (req, res) => {
  try {
    const { id, nodeId } = req.params;

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Obtener el flujo actual
    const { data: flow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Eliminar el nodo específico
    const updatedNodes = flow.nodes.filter((node: any) => (node as any).id !== nodeId);
    
    // También eliminar edges conectados a este nodo
    const updatedEdges = flow.edges.filter((edge: any) => 
      (edge as any).source !== nodeId && (edge as any).target !== nodeId
    );

    const { data: updatedFlow, error: updateError } = await supabase
      .from('flows')
      .update({
        nodes: updatedNodes,
        edges: updatedEdges,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error deleting node:', updateError);
      return res.status(500).json({ error: 'Failed to delete node' });
    }

    const transformedFlow = {
      ...updatedFlow,
      lastModified: updatedFlow.updated_at,
      assignedTo: updatedFlow.assigned_to?.name || 'Sin asignar'
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in DELETE /flows/:id/nodes/:nodeId:', error);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

// POST /api/flows/:id/nodes
router.post('/:id/nodes', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, position, data } = req.body;

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Obtener el flujo actual
    const { data: flow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Crear nuevo nodo
    const newNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type || 'text',
      position: position || { x: 100, y: 100 },
      data: data || {}
    };

    const updatedNodes = [...flow.nodes, newNode];

    const { data: updatedFlow, error: updateError } = await supabase
      .from('flows')
      .update({
        nodes: updatedNodes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error adding node:', updateError);
      return res.status(500).json({ error: 'Failed to add node' });
    }

    const transformedFlow = {
      ...updatedFlow,
      lastModified: updatedFlow.updated_at,
      assignedTo: updatedFlow.assigned_to?.name || 'Sin asignar'
    };

    res.status(201).json(transformedFlow);
  } catch (error) {
    console.error('Error in POST /flows/:id/nodes:', error);
    res.status(500).json({ error: 'Failed to add node' });
  }
});

// PUT /api/flows/:id/edges/:edgeId
router.put('/:id/edges/:edgeId', async (req, res) => {
  try {
    const { id, edgeId } = req.params;
    const { source, target, type, sourceHandle, targetHandle } = req.body;

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Obtener el flujo actual
    const { data: flow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Actualizar el edge específico
    const updatedEdges = flow.edges.map((edge: any) => 
      (edge as any).id === edgeId 
        ? { 
            ...edge, 
            source: source || edge.source, 
            target: target || edge.target, 
            type: type || edge.type,
            sourceHandle: sourceHandle || edge.sourceHandle,
            targetHandle: targetHandle || edge.targetHandle
          }
        : edge
    );

    const { data: updatedFlow, error: updateError } = await supabase
      .from('flows')
      .update({
        edges: updatedEdges,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating edge:', updateError);
      return res.status(500).json({ error: 'Failed to update edge' });
    }

    const transformedFlow = {
      ...updatedFlow,
      lastModified: updatedFlow.updated_at,
      assignedTo: updatedFlow.assigned_to?.name || 'Sin asignar'
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in PUT /flows/:id/edges/:edgeId:', error);
    res.status(500).json({ error: 'Failed to update edge' });
  }
});

// DELETE /api/flows/:id/edges/:edgeId
router.delete('/:id/edges/:edgeId', async (req, res) => {
  try {
    const { id, edgeId } = req.params;

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Obtener el flujo actual
    const { data: flow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Eliminar el edge específico
    const updatedEdges = flow.edges.filter((edge: any) => (edge as any).id !== edgeId);

    const { data: updatedFlow, error: updateError } = await supabase
      .from('flows')
      .update({
        edges: updatedEdges,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error deleting edge:', updateError);
      return res.status(500).json({ error: 'Failed to delete edge' });
    }

    const transformedFlow = {
      ...updatedFlow,
      lastModified: updatedFlow.updated_at,
      assignedTo: updatedFlow.assigned_to?.name || 'Sin asignar'
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in DELETE /flows/:id/edges/:edgeId:', error);
    res.status(500).json({ error: 'Failed to delete edge' });
  }
});

// POST /api/flows/:id/edges
router.post('/:id/edges', async (req, res) => {
  try {
    const { id } = req.params;
    const { source, target, type, sourceHandle, targetHandle } = req.body;

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Obtener el flujo actual
    const { data: flow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Crear nuevo edge
    const newEdge = {
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: source,
      target: target,
      type: type || 'default',
      sourceHandle: sourceHandle,
      targetHandle: targetHandle
    };

    const updatedEdges = [...flow.edges, newEdge];

    const { data: updatedFlow, error: updateError } = await supabase
      .from('flows')
      .update({
        edges: updatedEdges,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error adding edge:', updateError);
      return res.status(500).json({ error: 'Failed to add edge' });
    }

    const transformedFlow = {
      ...updatedFlow,
      lastModified: updatedFlow.updated_at,
      assignedTo: updatedFlow.assigned_to?.name || 'Sin asignar'
    };

    res.status(201).json(transformedFlow);
  } catch (error) {
    console.error('Error in POST /flows/:id/edges:', error);
    res.status(500).json({ error: 'Failed to add edge' });
  }
});

// PUT /api/flows/:id/reorder-nodes
router.put('/:id/reorder-nodes', async (req, res) => {
  try {
    const { id } = req.params;
    const { nodeOrder } = req.body; // Array de node IDs en nuevo orden

    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Obtener el flujo actual
    const { data: flow, error: fetchError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    // Reordenar nodos según el array recibido
    const reorderedNodes = (nodeOrder as string[]).map((nodeId: string, index: number) => {
      const originalNode = flow.nodes.find((n: any) => (n as any).id === nodeId);
      return {
        ...originalNode,
        position: {
          ...originalNode.position,
          y: index * 100 // Espaciado vertical
        }
      };
    });

    const { data: updatedFlow, error: updateError } = await supabase
      .from('flows')
      .update({
        nodes: reorderedNodes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error reordering nodes:', updateError);
      return res.status(500).json({ error: 'Failed to reorder nodes' });
    }

    const transformedFlow = {
      ...updatedFlow,
      lastModified: updatedFlow.updated_at,
      assignedTo: updatedFlow.assigned_to?.name || 'Sin asignar'
    };

    res.json(transformedFlow);
  } catch (error) {
    console.error('Error in PUT /flows/:id/reorder-nodes:', error);
    res.status(500).json({ error: 'Failed to reorder nodes' });
  }
});

// Create default flow endpoint
router.post('/create-default', async (req, res) => {
  try {
    const orgId = (req as any).organizationId;
    if (!orgId) return res.status(404).json({ error: 'Organization not found' });

    // Check if active flow already exists
    const { data: existingFlow } = await supabase
      .from('flows')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (existingFlow) {
      return res.json({ message: 'Active flow already exists', flow: existingFlow });
    }

    // Create default flow
    const { data: flow, error } = await supabase
      .from('flows')
      .insert({
        organization_id: orgId,
        name: 'Flujo de Bienvenida',
        description: 'Flujo básico de bienvenida con triggers',
        status: 'active',
        version: '1.0.0',
        category: 'welcome',
        triggers: ['hola', 'información', 'material', 'publicitario', 'ayuda', 'quiero'],
        is_active: true,
        nodes: [
          {
            id: '1',
            type: 'trigger',
            position: { x: 100, y: 100 },
            data: {}
          },
          {
            id: '2',
            type: 'text',
            position: { x: 300, y: 100 },
            data: {
              text: '¡Hola! 👋\n\nSoy el asistente virtual. Estoy aquí para ayudarte con información sobre nuestro material publicitario.\n\n¿Qué te gustaría conocer?\n\n1. Precios\n2. Características\n3. Contacto'
            }
          }
        ],
        edges: [
          {
            id: 'edge-1',
            source: '1',
            target: '2',
            type: 'default'
          }
        ]
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating default flow:', error);
      return res.status(500).json({ error: 'Failed to create default flow' });
    }

    res.json({ message: 'Default flow created successfully', flow });
  } catch (error: any) {
    console.error('Error in create-default flow:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
