import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Salesperson {
  documentType: string;
  documentNumber: number;
  firstNames: string;
  lastNames: string;
}

function readProducts(outputDir: string): Map<number, Product> {
  const filePath = join(outputDir, 'productos.txt');
  const products = new Map<number, Product>();
  readFileSync(filePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .forEach(line => {
      const [id, name, price] = line.split(';');
      products.set(Number(id), { id: Number(id), name, price: Number(price) });
    });
  return products;
}

function readSalespeople(outputDir: string): Map<number, Salesperson> {
  const filePath = join(outputDir, 'vendedores.txt');
  const sellers = new Map<number, Salesperson>();
  readFileSync(filePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .forEach(line => {
      const [documentType, documentNumber, firstNames, lastNames] = line.split(';');
      sellers.set(Number(documentNumber), {
        documentType,
        documentNumber: Number(documentNumber),
        firstNames,
        lastNames,
      });
    });
  return sellers;
}

function findSalesFiles(outputDir: string): string[] {
  return readdirSync(outputDir).filter(name => name.startsWith('ventas_') && name.endsWith('.txt'));
}

function accumulateSales(
  outputDir: string,
  salesFiles: string[],
  products: Map<number, Product>,
): { moneyBySeller: Map<number, number>; quantityByProduct: Map<number, number> } {
  const moneyBySeller = new Map<number, number>();
  const quantityByProduct = new Map<number, number>();

  salesFiles.forEach(fileName => {
    const lines = readFileSync(join(outputDir, fileName), 'utf8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    if (lines.length === 0) {
      return;
    }

    const [, documentNumberText] = lines[0].split(';');
    const documentNumber = Number(documentNumberText);
    let totalMoney = moneyBySeller.get(documentNumber) ?? 0;

    lines.slice(1).forEach(line => {
      const [productIdText, quantityText] = line.split(';');
      const productId = Number(productIdText);
      const quantity = Number(quantityText);
      const product = products.get(productId);
      if (!product) {
        throw new Error(`Producto con ID ${productId} (archivo ${fileName}) no existe en productos.txt`);
      }
      totalMoney += quantity * product.price;
      quantityByProduct.set(productId, (quantityByProduct.get(productId) ?? 0) + quantity);
    });

    moneyBySeller.set(documentNumber, totalMoney);
  });

  return { moneyBySeller, quantityByProduct };
}

// Reporte de vendedores: nombre;dinero recaudado, ordenado de mayor a menor.
function writeSellersReport(
  outputDir: string,
  sellers: Map<number, Salesperson>,
  moneyBySeller: Map<number, number>,
): void {
  const rows = Array.from(sellers.values())
    .map(seller => ({
      seller,
      total: moneyBySeller.get(seller.documentNumber) ?? 0,
    }))
    .sort((a, b) => b.total - a.total);

  const lines = rows.map(({ seller, total }) => `${seller.firstNames} ${seller.lastNames};${total}`);
  writeFileSync(join(outputDir, 'reporte_vendedores.txt'), lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

// Reporte de productos: nombre;precio;cantidad vendida, ordenado de mayor a menor por cantidad vendida.
function writeProductsReport(
  outputDir: string,
  products: Map<number, Product>,
  quantityByProduct: Map<number, number>,
): void {
  const rows = Array.from(products.values())
    .map(product => ({
      product,
      quantity: quantityByProduct.get(product.id) ?? 0,
    }))
    .sort((a, b) => b.quantity - a.quantity);

  const lines = rows.map(({ product, quantity }) => `${product.name};${product.price};${quantity}`);
  writeFileSync(join(outputDir, 'reporte_productos.txt'), lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
}

export function main(outputDir = process.cwd()): void {
  ['productos.txt', 'vendedores.txt'].forEach(fileName => {
    if (!existsSync(join(outputDir, fileName))) {
      throw new Error(`No se encontró el archivo requerido: ${fileName}. Ejecuta primero la generación de archivos.`);
    }
  });

  const products = readProducts(outputDir);
  const sellers = readSalespeople(outputDir);
  const salesFiles = findSalesFiles(outputDir);

  if (salesFiles.length === 0) {
    throw new Error('No se encontraron archivos de ventas (ventas_*.txt) para procesar.');
  }

  const { moneyBySeller, quantityByProduct } = accumulateSales(outputDir, salesFiles, products);

  writeSellersReport(outputDir, sellers, moneyBySeller);
  writeProductsReport(outputDir, products, quantityByProduct);

  console.log('Generación de reportes completada exitosamente.');
  console.log(`Archivos de ventas procesados: ${salesFiles.length}`);
  console.log('Reportes generados: reporte_vendedores.txt, reporte_productos.txt');
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('Ocurrió un error generando los reportes:', error);
    process.exitCode = 1;
  }
}
