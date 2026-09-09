-- ==========================================================
-- COLORLINK · ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- Proyecto: Reto Transversal Pintuco (Electiva IV)
-- ==========================================================

-- 1. TABLA: cliente (Información de los clientes que solicitan servicios)
CREATE TABLE IF NOT EXISTS public.cliente (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  N_identificacion numeric,
  nombre text,
  direccion text,
  email text,
  telefono numeric,
  CONSTRAINT cliente_pkey PRIMARY KEY (id)
);

-- 2. TABLA: canal (Canales de atención o captación)
CREATE TABLE IF NOT EXISTS public.canal (
  id_canal bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_canal text,
  CONSTRAINT canal_pkey PRIMARY KEY (id_canal)
);

-- 3. TABLA: proyecto (Proyectos asociados a los clientes)
CREATE TABLE IF NOT EXISTS public.proyecto (
  id_proyecto bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_cliente bigint NOT NULL,
  id_canal bigint,
  descripcion text,
  fecha timestamptz DEFAULT now(),
  estado smallint DEFAULT 1,
  presupuesto numeric,
  CONSTRAINT proyecto_pkey PRIMARY KEY (id_proyecto),
  CONSTRAINT proyecto_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON DELETE CASCADE,
  CONSTRAINT proyecto_id_canal_fkey FOREIGN KEY (id_canal) REFERENCES public.canal(id_canal) ON DELETE SET NULL
);

-- 4. TABLA: usuario (Usuarios del sistema / asesores / administradores)
CREATE TABLE IF NOT EXISTS public.usuario (
  id_usuario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  email text UNIQUE,
  telefono numeric,
  direccion text,
  rol text DEFAULT 'cliente',
  estado numeric DEFAULT 1,
  CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario)
);

-- 5. TABLA: solicitud (Radicación de necesidades técnicas)
CREATE TABLE IF NOT EXISTS public.solicitud (
  id_solicitud bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_proyecto bigint,
  detalles text,
  fecha timestamptz DEFAULT now(),
  estado text DEFAULT 'Pendiente',
  CONSTRAINT solicitud_pkey PRIMARY KEY (id_solicitud),
  CONSTRAINT solicitud_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyecto(id_proyecto) ON DELETE CASCADE
);

-- 6. TABLA: inventario (Catálogo de pinturas y materiales Pintuco)
CREATE TABLE IF NOT EXISTS public.inventario (
  id_inventario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  tipo text,
  stock numeric DEFAULT 0,
  precio numeric DEFAULT 0,
  CONSTRAINT inventario_pkey PRIMARY KEY (id_inventario)
);

-- 7. TABLA: material (Materiales asignados a una solicitud específica)
CREATE TABLE IF NOT EXISTS public.material (
  id_material bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_solicitud bigint,
  id_inventario bigint,
  nombre text,
  cantidad numeric,
  nom_enpacador text,
  CONSTRAINT material_pkey PRIMARY KEY (id_material),
  CONSTRAINT material_id_solicitud_fkey FOREIGN KEY (id_solicitud) REFERENCES public.solicitud(id_solicitud) ON DELETE CASCADE,
  CONSTRAINT material_id_inventario_fkey FOREIGN KEY (id_inventario) REFERENCES public.inventario(id_inventario) ON DELETE SET NULL
);

-- 8. TABLA: cotizacion (Solución técnica y económica propuesta)
CREATE TABLE IF NOT EXISTS public.cotizacion (
  id_cotizacion bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha_cotis timestamptz DEFAULT now(),
  detalles text,
  total numeric,
  CONSTRAINT cotizacion_pkey PRIMARY KEY (id_cotizacion)
);

-- 9. TABLA: factura (Facturación de la cotización aceptada)
CREATE TABLE IF NOT EXISTS public.factura (
  id_factura bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_cliente bigint,
  id_cotizacion bigint,
  descripcion text,
  total numeric,
  CONSTRAINT factura_pkey PRIMARY KEY (id_factura),
  CONSTRAINT factura_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.cliente(id) ON DELETE SET NULL,
  CONSTRAINT factura_id_cotizacion_fkey FOREIGN KEY (id_cotizacion) REFERENCES public.cotizacion(id_cotizacion) ON DELETE SET NULL
);

-- 10. TABLA: pedido (Orden de materiales y facturación)
CREATE TABLE IF NOT EXISTS public.pedido (
  id_pedido bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_solicitud bigint,
  id_material bigint,
  id_factura bigint,
  CONSTRAINT pedido_pkey PRIMARY KEY (id_pedido),
  CONSTRAINT pedido_id_solicitud_fkey FOREIGN KEY (id_solicitud) REFERENCES public.solicitud(id_solicitud) ON DELETE CASCADE,
  CONSTRAINT pedido_id_material_fkey FOREIGN KEY (id_material) REFERENCES public.material(id_material) ON DELETE SET NULL,
  CONSTRAINT pedido_id_factura_fkey FOREIGN KEY (id_factura) REFERENCES public.factura(id_factura) ON DELETE SET NULL
);

-- 11. TABLA: entrega (Coordinación de despacho / aplicación)
CREATE TABLE IF NOT EXISTS public.entrega (
  id_entrega bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_proyecto bigint,
  fecha timestamptz DEFAULT now(),
  estado text DEFAULT 'En proceso',
  CONSTRAINT entrega_pkey PRIMARY KEY (id_entrega),
  CONSTRAINT entrega_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyecto(id_proyecto) ON DELETE CASCADE
);

-- 12. TABLA: control_de_calidad (Inspección final y verificación)
CREATE TABLE IF NOT EXISTS public.control_de_calidad (
  id_control_cal bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_entrega bigint,
  resultado text,
  fecha timestamptz DEFAULT now(),
  CONSTRAINT control_de_calidad_pkey PRIMARY KEY (id_control_cal),
  CONSTRAINT control_de_calidad_id_entrega_fkey FOREIGN KEY (id_entrega) REFERENCES public.entrega(id_entrega) ON DELETE CASCADE
);

-- ==========================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- Ejecuta estas líneas en el "SQL Editor" de Supabase si
-- tus tablas tienen RLS activo y bloquean el guardado.
-- ==========================================================

-- Habilitar RLS en tablas principales de clientes y solicitudes
ALTER TABLE IF EXISTS public.cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.solicitud ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.proyecto ENABLE ROW LEVEL SECURITY;

-- Permitir inserción pública desde el formulario web (anon)
CREATE POLICY "Permitir registrar clientes" ON public.cliente FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leer clientes" ON public.cliente FOR SELECT USING (true);

CREATE POLICY "Permitir registrar solicitudes" ON public.solicitud FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leer solicitudes" ON public.solicitud FOR SELECT USING (true);

CREATE POLICY "Permitir registrar proyectos" ON public.proyecto FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leer proyectos" ON public.proyecto FOR SELECT USING (true);

