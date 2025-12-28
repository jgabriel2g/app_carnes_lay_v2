import { Injectable } from '@angular/core';

export interface DecodedBarcode {
  productCode: string;
  sellerCode: string;
  weight: number;
  checkDigit: string;
  isValid: boolean;
  rawCode: string;
}

// Interfaz compatible con DisplayStock y ProductStock
export interface ProductWithBarcode {
  barcode?: string | null;
  product: {
    code: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BarcodeDecoderService {

  /**
   * Decodifica un código de barras.
   *
   * Formatos soportados:
   * - 7 dígitos: PPKKGGG (2 dígitos producto + 2 kilos + 3 gramos)
   * - 8 dígitos: PPPKKGGG (3 dígitos producto + 2 kilos + 3 gramos)
   * - Otros: Busca coincidencia exacta en el listado de productos
   *
   * Ejemplos:
   * - "0101500" = producto 01, peso 01.500 kg
   * - "00101500" = producto 001, peso 01.500 kg
   */
  decode(barcode: string, products: ProductWithBarcode[] = []): DecodedBarcode {
    const result: DecodedBarcode = {
      productCode: '',
      sellerCode: '',
      weight: 0,
      checkDigit: '',
      isValid: false,
      rawCode: barcode
    };

    if (!barcode) {
      return result;
    }

    // Formato de balanza: 7 u 8 dígitos numéricos
    if (barcode.length === 7 || barcode.length === 8) {
      return this.decodeScaleBarcode(barcode, result);
    }

    // Otros formatos: buscar coincidencia exacta en productos
    return this.findProductByBarcode(barcode, products, result);
  }

  /**
   * Decodifica código de balanza (7 u 8 dígitos)
   * - 7 dígitos: PP + KKGGG
   * - 8 dígitos: PPP + KKGGG
   */
  private decodeScaleBarcode(barcode: string, result: DecodedBarcode): DecodedBarcode {
    // Validar que sean solo números
    if (!/^\d+$/.test(barcode)) {
      console.warn('Código de barras inválido: contiene caracteres no numéricos', barcode);
      return result;
    }

    try {
      const productCodeLength = barcode.length === 7 ? 2 : 3;
      const productCode = barcode.substring(0, productCodeLength);
      const weightString = barcode.substring(productCodeLength); // Últimos 5 dígitos

      // Convertir peso: KK.GGG
      const kilos = parseInt(weightString.substring(0, 2), 10);
      const gramos = parseInt(weightString.substring(2, 5), 10);
      const weight = kilos + (gramos / 1000);

      result.productCode = productCode;
      result.weight = weight;
      result.isValid = true;

      console.log('✅ Código de balanza decodificado:', {
        código: barcode,
        producto: productCode,
        peso: `${weight} kg`
      });

      return result;

    } catch (error) {
      console.error('Error al decodificar código de barras:', error);
      return result;
    }
  }

  /**
   * Busca un producto por código de barras exacto
   */
  private findProductByBarcode(
    barcode: string,
    products: ProductWithBarcode[],
    result: DecodedBarcode
  ): DecodedBarcode {
    const productFound = products.find(p => p.barcode === barcode);

    if (productFound) {
      result.productCode = productFound.product.code;
      result.weight = 1;
      result.isValid = true;

      console.log('✅ Producto encontrado por código de barras:', {
        barcode,
        nombre: productFound.product.name,
        codigo: productFound.product.code
      });
      return result;
    }

    console.warn('Código de barras no reconocido:', barcode);
    return result;
  }
}
