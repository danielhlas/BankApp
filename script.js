'use strict';
//Lze rozšířit o chybovou hlášku při nesprávných údajích

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2023-05-31T17:01:17.194Z',
    '2023-06-05T23:36:17.929Z',
    '2023-06-06T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

///////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

///////////////////////////////////////////////////
//Functions
const LogOutTimer = function () {
  const tick = function () {
    labelTimer.textContent = time;

    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    time--;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
  };

  let time = 10 * 60;

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
//-----------------------
const formatMovementDate = function (date) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const curDay = `${date.getDate()}`.padStart(2, 0);
    const curMonth = `${date.getMonth() + 1}`.padStart(2, 0);
    const curYear = date.getFullYear();
    return `${curDay}/${curMonth}/${curYear}`;
  }
};

//-----------------------
const displayMovements = function (acc, sort = false) {
  //clear the conteiner
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  //write rows to conteiner
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}"> 
      ${type} </div>
      <div class="movements__date"> ${displayDate}</div>
      <div class="movements__value">${mov.toFixed(2)}€</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/////////////////////////////////////////////////
//update UI function
const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplaySummary(acc);
  sumBalance(acc);
};
//////////////////////////////

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const eurToUsd = 1.1;
const movementsUSD = movements.map(mov => mov * eurToUsd);

/////////////////////////////////////////////////
//Full name -> nickname
const createUsernames = function (accounts) {
  accounts.forEach(function (i) {
    i.nickname = i.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

/////////////////////////////////////////////////
//Summary of movements
const sumBalance = function (acc) {
  const balance = acc.movements.reduce(function (sum, i) {
    return sum + i;
  }, 0);
  acc.balance = balance;

  labelBalance.textContent = `${balance.toFixed(2)}€`;
};

//////////////////////////////////////////////////
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(function (i) {
      return i > 0;
    })
    .reduce(function (sum, i) {
      return sum + i;
    }, 0);
  labelSumIn.textContent = `${incomes}€`;

  ////////////////////////////outcome
  const outcomes = acc.movements
    .filter(function (i) {
      return i < 0;
    })
    .reduce(function (sum, i) {
      return sum + i;
    }, 0);
  labelSumOut.textContent = `${Math.abs(outcomes).toFixed(2)}€`;

  ////////////////////////////interest
  const interest = acc.movements
    .filter(function (i) {
      return i > 0;
    })
    .map(deposit => (deposit * acc.interestRate) / 100)
    .reduce(function (sum, i) {
      return sum + i;
    }, 0);

  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

/////////////////////////////////////////////////
//Summary of withdraw/deposit
const deposits = movements.filter(function (i) {
  return i > 0;
});

const withdraw = movements.filter(function (i) {
  return i < 0;
});

const maximum = movements.reduce(function (sum, i) {
  if (sum < i) {
    return (sum = i);
  } else {
    return sum;
  }
}, 0);

//////////////////////////////////////////
//Converting eur -> usd
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map(mov => mov * 1.1)
  .reduce((acc, mov) => acc + mov, 0);

//////////////////////////////////////////
//LOGIN

//find user
let currentUsername, timer;

btnLogin.addEventListener('click', function (a) {
  a.preventDefault();

  currentUsername = accounts.find(
    acc => acc.nickname === inputLoginUsername.value
  );

  //check password
  if (currentUsername && currentUsername.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentUsername.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    //add login current date
    const now = new Date();
    const curDay = `${now.getDate()}`.padStart(2, 0);
    const curMonth = `${now.getMonth() + 1}`.padStart(2, 0);
    const curYear = now.getFullYear();

    labelDate.textContent = `${curDay}/${curMonth}/${curYear}`;

    //clear input fields
    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginUsername.blur();
    inputLoginPin.blur();

    ///Update UI (calling functions)
    if (timer) clearInterval(timer);
    timer = LogOutTimer();
    updateUI(currentUsername);
  }

  //////////////
  //Sort
  let sorted = false;
  btnSort.addEventListener('click', function (a) {
    a.preventDefault();
    displayMovements(currentUsername, !sorted);
    sorted = !sorted;
  });
});

////////////////////////////////////////////////
//Transfer
btnTransfer.addEventListener('click', function (a) {
  a.preventDefault();
  const inputedAmount = Number(inputTransferAmount.value);
  const receiver = accounts.find(acc => acc.nickname === inputTransferTo.value);

  inputTransferAmount.value = inputTransferTo.value = '';

  //enough money check
  if (
    inputedAmount > 0 &&
    currentUsername.balance >= inputedAmount &&
    receiver &&
    receiver !== currentUsername.nickname
  ) {
    currentUsername.movements.push(-inputedAmount);
    receiver.movements.push(inputedAmount);

    currentUsername.movementsDates.push(new Date());
    receiver.movementsDates.push(new Date());

    updateUI(currentUsername);

    //Timer to default value
    clearInterval(timer);
    timer = LogOutTimer();
  }
});

/////////////////////////////////
//Delete account
btnClose.addEventListener('click', function (a) {
  a.preventDefault();

  if (
    inputCloseUsername.value === currentUsername.nickname &&
    Number(inputClosePin.value) === currentUsername.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.nickname === currentUsername.nickname
    );

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

/////////////////////////////////////
//Get loan
btnLoan.addEventListener('click', function (a) {
  a.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentUsername.movements.some(i => i >= amount * 0.1)) {
    currentUsername.movements.push(amount);

    currentUsername.movementsDates.push(new Date().toISOString());

    updateUI(currentUsername);

    clearInterval(timer);
    timer = LogOutTimer();
  }
  inputLoanAmount.value = '';
});
