---
name: mi-colacion-db-operations
description: Proporciona patrones seguros para operar la base de datos Supabase de Mi Colación. Usar cuando se crea una migración SQL, se necesita consultar tablas, se quiere agregar datos semilla o se realiza cualquier operación DDL o DML. Incluye restricciones de seguridad críticas.
---

# 🗄️ Operaciones de Base de Datos — Mi Colación

## Conexión al Proyecto Supabase

- **Project ID**: `ijagwprtbhkadqwbaran`
- **Región**: (verificar en dashboard)
- **MCP Server**: `supabase-mcp-server` disponible para consultas directas.

---

## Convenciones SQL Obligatorias

1. **snake_case** para TODOS los nombres de tablas y columnas.
2. Toda tabla DEBE tener `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
3. Toda tabla DEBE tener `created_at TIMESTAMPTZ DEFAULT now()`.
4. Usar ENUMs de PostgreSQL para campos con valores fijos.
5. Las FK deben tener `ON DELETE CASCADE` o `ON DELETE SET NULL` explícito.

---

## Consultas de Referencia Rápida

### Obtener menú activo del día

```sql
SELECT c.nombre as categoria, i.*
FROM items_menu i
JOIN categorias c ON i.categoria_id = c.id
WHERE i.activo = true
ORDER BY c.nombre, i.nombre;
```

### Obtener pedidos del día con cliente

```sql
SELECT p.*, pr.nombre as cliente_nombre, pr.email
FROM pedidos p
JOIN profiles pr ON p.cliente_id = pr.id
WHERE p.created_at::date = CURRENT_DATE
ORDER BY p.created_at DESC;
```

### Obtener pedidos pendientes (para admin)

```sql
SELECT p.id, p.numero_pedido, p.estado, p.total, p.tipo_entrega,
       pr.nombre as cliente, p.direccion_entrega, p.notas
FROM pedidos p
JOIN profiles pr ON p.cliente_id = pr.id
WHERE p.estado IN ('pendiente', 'confirmado', 'preparando')
ORDER BY p.created_at ASC;
```

### Actualizar estado de un pedido

```sql
UPDATE pedidos SET estado = 'confirmado' WHERE id = '<uuid>';
```

---

## Políticas RLS (Row Level Security)

**CRÍTICO**: Toda tabla nueva DEBE tener RLS habilitado con políticas.

### Patrón de política para clientes

```sql
-- El cliente solo ve sus propios datos
CREATE POLICY "cliente_ver_propios" ON pedidos
  FOR SELECT USING (auth.uid() = cliente_id);
```

### Patrón de política para admin

```sql
-- Admin ve todo
CREATE POLICY "admin_ver_todo" ON pedidos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );
```

---

## Procedimiento para Migraciones Nuevas

1. Usar `mcp_supabase-mcp-server_apply_migration` para DDL (CREATE/ALTER/DROP).
2. Usar `mcp_supabase-mcp-server_execute_sql` para DML (INSERT/UPDATE/SELECT).
3. Siempre verificar con `mcp_supabase-mcp-server_list_tables` después de crear tablas.
4. Ejecutar `mcp_supabase-mcp-server_get_advisors` (security) tras cualquier cambio de esquema.

---

## Datos Semilla de Referencia (categorías base)

```sql
INSERT INTO categorias (nombre, orden) VALUES
  ('Almuerzo', 1),
  ('Ensaladas', 2),
  ('Bebidas', 3),
  ('Postres', 4)
ON CONFLICT DO NOTHING;
```

---

## ⚠️ Restricciones de Seguridad

- **NUNCA** usar `service_role_key` desde el cliente (browser).
- **NUNCA** confiar en los precios enviados por el cliente al hacer un pedido. Siempre recalcular en el servidor.
- **NUNCA** ejecutar `DROP TABLE` sin confirmación explícita del usuario.
- **SIEMPRE** verificar `auth.uid()` en Server Actions antes de escribir datos.
