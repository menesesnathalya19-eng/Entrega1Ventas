# Generador y procesador de archivos de ventas

Proyecto en TypeScript con Node.js que genera archivos de texto de prueba (productos,
vendedores y ventas) y luego los procesa para generar los reportes finales de ventas.
No solicita datos por teclado.

## Integrantes
- INGRID VIVIANA ARENAS MALDONADO
- JOHAN PATAQUIVA VARGAS
- NATHALYA BRIGITTE MENESES RAMIREZ
- CRISTHIAN FERNANDO MELO MONTILLA

## Requisitos

- Node.js 18 o posterior
- pnpm

## Instalar y ejecutar

```sh
pnpm install
pnpm run generate   # genera productos.txt, vendedores.txt y ventas_*.txt
pnpm run report     # procesa esos archivos y genera los reportes
```

`pnpm run build` compila TypeScript a `dist/`; `pnpm start` ejecuta el generador de
archivos compilado. Todo se lee y escribe en el directorio de trabajo actual, así que
`pnpm run report` debe ejecutarse después de `pnpm run generate`.

## Archivos generados

- `productos.txt`: 15 productos, con formato `ID;Nombre;Precio`.
- `vendedores.txt`: 8 vendedores, con formato `TipoDocumento;NumeroDocumento;Nombres;Apellidos`.
- `ventas_<documento>_<nombre>.txt`: un archivo por vendedor. La primera línea identifica al vendedor (`TipoDocumento;NumeroDocumento`); las siguientes contienen producto y cantidad (`IDProducto;Cantidad;`). Cada archivo tiene de 3 a 8 ventas, y cada cantidad es de 1 a 20.

Los datos son pseudoaleatorios y los campos están separados por punto y coma; no se incluyen encabezados. Al ejecutar el generador se sobrescriben `productos.txt`, `vendedores.txt` y los archivos de ventas cuyo nombre coincida. Los archivos de ventas antiguos con nombres diferentes no se borran automáticamente.

## Reportes generados

- `reporte_vendedores.txt`: un vendedor por línea (`NombresApellidos;DineroRecaudado`), ordenado de mayor a menor según el dinero recaudado.
- `reporte_productos.txt`: un producto por línea (`Nombre;Precio;CantidadVendida`), ordenado de mayor a menor según la cantidad vendida.

El dinero recaudado por vendedor es la suma de `cantidad × precio` de cada venta registrada en su archivo `ventas_*.txt`; la cantidad vendida por producto es la suma de las cantidades de ese producto en todos los archivos de ventas.

## Estructura

```text
src/GenerateInfoFiles.ts  # Genera productos, vendedores y ventas (primer programa con "main")
src/main.ts                # Procesa las ventas y genera los reportes (segundo programa con "main")
productos.txt             # Datos generados de productos
vendedores.txt            # Datos generados de vendedores
ventas_*.txt              # Datos generados de ventas
reporte_vendedores.txt    # Reporte de vendedores por dinero recaudado
reporte_productos.txt     # Reporte de productos por cantidad vendida
conclusion.txt            # Reflexión final del proyecto
```
