export interface EvalResult {
  success: boolean;
  value: number;
  display: string;
  error?: string;
}

export function evaluateExpression(expression: string): EvalResult {
  const clean = expression.trim();
  if (!clean) {
    return { success: true, value: 0, display: '0' };
  }

  try {
    const tokens = tokenize(clean);
    if (tokens.length === 0) {
      return { success: true, value: 0, display: '0' };
    }

    const value = evaluateTokens(tokens);
    if (isNaN(value) || !isFinite(value)) {
      return { success: false, value: 0, display: '0', error: 'Cannot divide by zero' };
    }

    // Round small floating point inaccuracies (e.g. 0.1 + 0.2 = 0.3)
    const rounded = Math.round(value * 1e10) / 1e10;
    const display = rounded.toString();

    return { success: true, value: rounded, display };
  } catch (err: any) {
    return { success: false, value: 0, display: '0', error: err?.message || 'Invalid expression' };
  }
}

type Token =
  | { type: 'number'; value: number }
  | { type: 'op'; value: string }
  | { type: 'percent' };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = expr.length;

  while (i < n) {
    const ch = expr[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/\d|\./.test(ch)) {
      let numStr = '';
      while (i < n && /[\d.]/.test(expr[i])) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) || 0 });
      continue;
    }

    if (ch === '%') {
      tokens.push({ type: 'percent' });
      i++;
      continue;
    }

    if (['+', '-', '*', '/'].includes(ch)) {
      // Unary minus check
      if (ch === '-' && (tokens.length === 0 || tokens[tokens.length - 1].type === 'op')) {
        i++;
        let numStr = '-';
        while (i < n && /[\d.]/.test(expr[i])) {
          numStr += expr[i];
          i++;
        }
        tokens.push({ type: 'number', value: parseFloat(numStr) || 0 });
        continue;
      }
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    i++;
  }

  return tokens;
}

function evaluateTokens(tokens: Token[]): number {
  // Step 1: Resolve percentages
  const step1: Token[] = [];
  let i = 0;
  while (i < tokens.length) {
    const curr = tokens[i];
    if (curr.type === 'percent') {
      if (step1.length > 0 && step1[step1.length - 1].type === 'number') {
        const prevNum = (step1.pop() as { type: 'number'; value: number }).value;
        if (step1.length >= 2 && step1[step1.length - 1].type === 'op') {
          const op = (step1[step1.length - 1] as { type: 'op'; value: string }).value;
          const leftNum = (step1[step1.length - 2] as { type: 'number'; value: number }).value;
          const resolved =
            op === '+' || op === '-' ? (leftNum * prevNum) / 100 : prevNum / 100;
          step1.push({ type: 'number', value: resolved });
        } else {
          step1.push({ type: 'number', value: prevNum / 100 });
        }
      }
    } else {
      step1.push(curr);
    }
    i++;
  }

  if (step1.length === 0) return 0;

  // Step 2: Multiplication and Division
  const step2: Token[] = [];
  let j = 0;
  while (j < step1.length) {
    const t = step1[j];
    if (t.type === 'op' && (t.value === '*' || t.value === '/')) {
      const left = (step2.pop() as { type: 'number'; value: number }).value;
      j++;
      const rightToken = step1[j];
      const right = rightToken && rightToken.type === 'number' ? rightToken.value : 0;
      if (t.value === '/') {
        if (right === 0) throw new Error('Cannot divide by zero');
        step2.push({ type: 'number', value: left / right });
      } else {
        step2.push({ type: 'number', value: left * right });
      }
    } else {
      step2.push(t);
    }
    j++;
  }

  if (step2.length === 0) return 0;

  // Step 3: Addition and Subtraction
  let result = (step2[0] as { type: 'number'; value: number }).value;
  let k = 1;
  while (k < step2.length) {
    const op = (step2[k] as { type: 'op'; value: string }).value;
    const next = (step2[k + 1] as { type: 'number'; value: number })?.value ?? 0;
    if (op === '+') result += next;
    if (op === '-') result -= next;
    k += 2;
  }

  return result;
}
