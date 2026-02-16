# Gestión de Productos - Frontend Angular

# 📌 Contexto

Aplicación web desarrollada en **Angular 17** que permite gestionar
productos financieros mediante:

-   Listado de productos
-   Creación de nuevos productos
-   Edición
-   Eliminación con confirmación
-   Búsqueda y paginación dinámica
-   Validaciones síncronas y asíncronas
-   Alertas de éxito y error

La aplicación consume un servicio REST externo encargado de la
persistencia.

------------------------------------------------------------------------

# 🏗 Enfoque Arquitectónico

Se implementa una arquitectura basada en separación por capas:

Browser\
↓\
Angular Application\
├── Core\
│ ├── Services (ProductService)\
│ └── Models (Product)\
│\
├── Features\
│ ├── ProductsComponent (Listado)\
│ └── ProductFormComponent (Crear / Editar)\
│\
├── Shared\
│ ├── ConfirmModalComponent\
│ └── AlertService + AlertComponent

------------------------------------------------------------------------

# 📂 Estructura del Proyecto

    src/
     ├── core/
     ├── features/
     │    └── products/
     ├── shared/
     └── app/

------------------------------------------------------------------------

# 🧩 Componentes Principales

## 📦 ProductsComponent

Responsabilidades:

-   Obtener productos desde API
-   Filtrar por nombre o descripción
-   Controlar paginación
-   Manejar menú contextual
-   Confirmar eliminación
-   Mostrar alertas

Se utilizan **Angular Signals** para:

-   products()
-   searchTerm()
-   pageSize()
-   isLoading()
-   errorMessage()

Se implementa:

-   `computed()` para productos filtrados y visibles
-   `ChangeDetectionStrategy.OnPush`
-   `trackBy` para optimización de render

------------------------------------------------------------------------

## 📝 ProductFormComponent

Responsabilidades:

-   Crear producto
-   Editar producto existente
-   Validaciones robustas
-   Manejo de estado de envío

### Validaciones implementadas

-   Required
-   Min / Max Length
-   Async validator (verificación de ID existente)
-   Custom validator (fecha no pasada)

### Lógica adicional

-   date_revision se calcula automáticamente +1 año desde date_release
-   En modo edición se deshabilita el ID

------------------------------------------------------------------------

## 🔔 AlertService

Servicio reactivo basado en Signals.

Tipos de alerta:

``` ts
type AlertType = 'success' | 'error' | 'info';
```

-   show(message, type)
-   clear()

Las alertas se autolimpian tras 2 segundos.

------------------------------------------------------------------------

# 🔄 Flujo de la Aplicación

1.  Usuario accede al listado.
2.  Se ejecuta loadProducts().
3.  Se renderiza tabla con paginación.
4.  Puede:
    -   Crear
    -   Editar
    -   Eliminar
5.  Operaciones muestran feedback mediante AlertService.

------------------------------------------------------------------------

# ⚙️ Manejo de Estado

Se utilizan **Angular Signals** en lugar de estado global externo.

Ventajas:

-   Reactividad declarativa
-   Código más predecible
-   Sin dependencias externas
-   Mejor integración con Angular moderno

------------------------------------------------------------------------

# ❗ Manejo de Errores

-   Error HTTP → mensaje controlado
-   Errores de validación → mostrados en formulario
-   Errores en eliminación/creación → alertas visuales
-   No se exponen detalles internos del backend

------------------------------------------------------------------------

# 📦 Instalación

``` bash
npm install
npm run start
```

Por defecto:

http://localhost:4200

------------------------------------------------------------------------

# 📦 Ejecución de Tests

``` bash
npm run test
```

------------------------------------------------------------------------

# 🧪 Testing

Framework: **Jest**

Cobertura aproximada:

-   Servicios: 100%
-   Componentes principales: \~85-90%
-   Cobertura global: \~89%

Se probaron:

-   Async validators
-   Manejo de errores
-   Confirmación de eliminación
-   Cálculo automático de fechas
-   Guard clauses


------------------------------------------------------------------------

# 🎯 Decisiones Técnicas

-   Uso de Standalone Components
-   Uso de Angular Signals
-   ChangeDetectionStrategy.OnPush
-   Separación Core / Feature / Shared
-   Tipado fuerte con TypeScript
-   Testing con Jest
