
export interface Liquor {
  id: string;
  name: string;
  emptyWeight: number;
}

export interface CalculationResult {
  value: number;
  unit: 'oz' | 'ml' | 'copas';
  liquidWeight: number;
  percentage?: number;
  totalCapacity?: number;
}
