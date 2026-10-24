export function rupeesToPaise(amount: number): number {
  return Math.round(amount * 100);
}

export function paiseToRupees(amountPaise: number): number {
  return amountPaise / 100;
}
