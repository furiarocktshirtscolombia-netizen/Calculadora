
import { Liquor } from '../types';
import { NAME_COL_ALIAES, WEIGHT_COL_ALIASES } from '../constants';

declare const XLSX: any;

export const parseExcel = (data: ArrayBuffer): Liquor[] => {
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

  return jsonData.map((row, index) => {
    let name = '';
    let weight = 0;

    // Detect Name Column
    for (const alias of NAME_COL_ALIAES) {
      const key = Object.keys(row).find(k => k.toUpperCase().includes(alias));
      if (key) {
        name = row[key];
        break;
      }
    }

    // Detect Weight Column
    for (const alias of WEIGHT_COL_ALIASES) {
      const key = Object.keys(row).find(k => k.toUpperCase().includes(alias));
      if (key) {
        weight = parseFloat(row[key]) || 0;
        break;
      }
    }

    return {
      id: `liquor-${index}`,
      name: name || 'Desconocido',
      emptyWeight: weight
    };
  }).filter(l => l.name !== 'Desconocido');
};

export const fetchDefaultExcel = async (): Promise<Liquor[]> => {
  try {
    const response = await fetch('/LICORES.xlsx');
    if (!response.ok) throw new Error('File not found');
    const arrayBuffer = await response.arrayBuffer();
    return parseExcel(arrayBuffer);
  } catch (error) {
    console.error('Failed to auto-load Excel:', error);
    throw error;
  }
};
