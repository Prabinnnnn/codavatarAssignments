const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let firstNumber = '';
let operator = '';
let secondNumber = '';
let displayExpression = '';

buttons.forEach(button => {
  button.addEventListener('click', handleButtonClick);
});

function handleButtonClick(event) {
  const value = event.target.dataset.value;

  if (isNumber(value) || value === '.') {
    handleNumberInput(value);
  } else if (isOperator(value)) {
    handleOperatorInput(value);
  } else if (value === '=') {
    calculateResult();
  } else if (value === 'C') {
    clearDisplay();
  } else if (value === 'DEL') {
    deleteLastCharacter();
  }
}

function isNumber(value) {
  return value >= '0' && value <= '9';
}

function isOperator(value) {
  return ['+', '-', '*', '/'].includes(value);
}

function handleNumberInput(value) {
  if (value === '.' && secondNumber.includes('.')) {
    return;
  }

  if (operator === '') {
    firstNumber += value;
    displayExpression = firstNumber;
    display.value = firstNumber;
  } else {
    secondNumber += value;
    displayExpression = firstNumber + ' ' + operator + ' ' + secondNumber;
    display.value = displayExpression;
  }
}

function handleOperatorInput(value) {
  if (firstNumber === '') {
    return;
  }

  if (secondNumber !== '') {
    calculateResult();
  }

  operator = value;
  displayExpression = firstNumber + ' ' + operator + ' ';
  display.value = displayExpression;
}

function calculateResult() {
  if (firstNumber === '' || operator === '' || secondNumber === '') {
    return;
  }

  const num1 = parseFloat(firstNumber);
  const num2 = parseFloat(secondNumber);
  let result;

  switch (operator) {
    case '+':
      result = num1 + num2;
      break;
    case '-':
      result = num1 - num2;
      break;
    case '*':
      result = num1 * num2;
      break;
    case '/':
      if (num2 === 0) {
        display.value = 'Error: Div by 0';
        clearCalculator();
        return;
      }
      result = num1 / num2;
      break;
    default:
      return;
  }

  result = Math.round(result * 100000000) / 100000000;
  displayExpression = String(result);
  display.value = displayExpression;
  firstNumber = String(result);
  operator = '';
  secondNumber = '';
}

function clearDisplay() {
  display.value = '0';
  clearCalculator();
}

function clearCalculator() {
  firstNumber = '';
  operator = '';
  secondNumber = '';
  displayExpression = '';
}

function deleteLastCharacter() {
  if (operator === '') {
    firstNumber = firstNumber.slice(0, -1);
    displayExpression = firstNumber || '0';
    display.value = displayExpression;
  } else {
    secondNumber = secondNumber.slice(0, -1);
    displayExpression = firstNumber + ' ' + operator + ' ' + secondNumber;
    display.value = displayExpression;
  }
}
