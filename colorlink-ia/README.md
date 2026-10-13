# ColorLink · Ecosistema Integral de Pintura Inteligente Pintuco S.A.

> **Proyecto Transversal · Electiva IV (Universidad Cooperativa de Colombia - UCC)**  
> Plataforma de transformación digital que conecta integralmente el ciclo de vida de la pintura: desde la necesidad del cliente y formulación técnica hasta el despacho en CEDI, facturación electrónica y garantía de calidad.

---

## 🎨 Características Principales

### 1. Portal Comercial & Experiencia de Usuario
- **Portafolio Oficial Pintuco:** Líneas arquitectónicas, fachadas, maderas, metales e industriales (Viniltex BioCuidado, Koraza Sol & Lluvia, Pintulux 3 en 1, Pintucoat Epóxico, Sellomax, etc.).
- **Paleta Oficial "Brisa Marina Clásica":** Selección armónica de tonos (Brisa Caribeña, Menta Salvia, Azul Pizarra, Mar Profundo, Luz de Arena, etc.) con simulador en tiempo real.
- **Formulación por Ambientes:** Soluciones específicas para salas, fachadas, alcobas, cocinas/baños y pisos de alto tráfico.
- **Proyectos Reales de Clientes:** Casos de éxito con testimonios, productos aplicados y rendimiento en m².

### 2. Motor de Cálculo Técnico Oficial Pintuco
- **Cálculo por Dimensiones:** Ingreso de ancho, alto y número de muros con deducción paramétrica de puertas y ventanas.
- **Cálculo por Área Directa:** Desglose exacto en cuñetes (5 Gal) y galones individuales para optimizar desperdicio.
- **Insumos y Preparación:** Sugerencia automática de imprimantes, selladores, lijas, masillas, brochas y rodillos según la superficie.
- **Presupuesto Estimado:** Costeo de referencia en pesos colombianos (COP).

### 3. Ecosistema Transversal (12 Tablas ERD en Supabase)
El sistema implementa y sincroniza las 12 entidades del Reto Transversal:
1. `Usuario` (Roles y accesos)
2. `Canal` (Directo Pintuco, Portal Web, Distribuidor Aliado, Constructor VIP)
3. `Cliente` (Constructoras y clientes residenciales)
4. `Proyecto` (Obras y presupuestos)
5. `Inventario` (Catálogo con SKUs y stock en CEDI Rionegro)
6. `Solicitud` (Requerimiento técnico de metraje, superficie y color)
7. `Material` (Materiales asignados para alistamiento)
8. `Pedido` (Detalles de empaque, peso en kg, sellos de calidad y QR)
9. `Cotización` (Cálculo formal valorizado)
10. `Factura` (Facturación electrónica con exportación a PDF)
11. `Entrega` (Despacho, conductor asignado, ruta y firma digital)
12. `Control de Calidad` (Inspección técnica de película y certificado PDF)

### 4. Dashboards por Rol Operativo
- **Administrador:** Métricas operativas, control de stock en bodegas, gestión de usuarios y pedidos.
- **Cliente:** Consulta de cotizaciones, timeline de despacho en vivo y descarga de facturas/certificados.
- **Empacador (CEDI):** Checklist de verificación de empaque, asignación de lotes y precintos de seguridad.
- **Conductor (Logística):** Rutas de entrega en ciudades colombianas y captura de firma de recibido.
- **Ecosistema Transversal:** Vista de visualización global del flujo del proyecto.

### 5. Herramientas Avanzadas Integradas
- **Asistente de IA (Gemini):** Consultor técnico virtual con la API de Google Gemini para asesoría técnica de aplicación.
- **Generación de PDFs:** Descarga instantánea de Factura DIAN y Certificados de Calidad con `jsPDF` y `html2canvas`.
- **Notificaciones por Correo:** Buzón interactivo que notifica automáticamente los cambios de estado de cada pedido.
- **Supabase Cloud:** Sincronización en tiempo real y persistencia local integrada.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion
- **Empaquetador:** Vite 6
- **Base de Datos & Backend:** Supabase (PostgreSQL + RLS)
- **IA:** Google Gen AI SDK (`@google/genai`)
- **Documentos & Exportación:** jsPDF, html2canvas
- **Iconografía:** Lucide React

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js (versión 18 o superior recomendada)
- npm

### Pasos
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/felipeyate/colorlink-ia.git
   cd colorlink-ia
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. Para compilar la versión de producción:
   ```bash
   npm run build
   ```

---

## 👥 Colaboradores
- **Felipe Yate**
- **Equipo de Proyecto Electiva IV · UCC**
