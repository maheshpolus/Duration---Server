var http = require ('http');

function getDuration (
  startDate,
  endDate,
  isIncludeStartDate = true,
  isIncludeEndDate = true
) {
  let actualStartDate = new Date (startDate);
  let actualEndDate = new Date (endDate);
  actualStartDate = isIncludeStartDate
    ? actualStartDate
    : new Date (actualStartDate.setDate (actualStartDate.getDate () + 1));
  actualEndDate = isIncludeEndDate
    ? actualEndDate
    : new Date (actualEndDate.setDate (actualEndDate.getDate () - 1));
  startDate = getStartDateAfterRemovingIncompleteMonth (
    actualStartDate,
    actualEndDate
  );
  endDate = getEndDateAfterRemovingIncompleteMonth (
    actualEndDate,
    actualStartDate
  );
  let years = 0, months = 0, days = 0;
  let currentMonth = startDate.getMonth ();
  let currentYear = startDate.getFullYear ();
  let differenceInDays = getDifferenceInDays (startDate, endDate);
  let daysInCurrentMonth = getNumberOfDaysInAMonth (currentMonth, currentYear);
  while (differenceInDays > 0 && differenceInDays >= daysInCurrentMonth) {
    differenceInDays = differenceInDays - daysInCurrentMonth;
    months += 1;
    currentMonth = currentMonth + 1;
    if (months == 12) {
      years += 1;
      months = 0;
    }
    if (currentMonth === 12) {
      currentMonth = 0;
      currentYear += 1;
    }
    daysInCurrentMonth = getNumberOfDaysInAMonth (currentMonth, currentYear);
  }
  days = differenceInDays > 0 ? differenceInDays : 0;
  daysInCurrentMonth = 0;
  if (actualStartDate !== startDate) {
    days +=
      getNumberOfDaysInAMonth (
        actualStartDate.getMonth (),
        actualStartDate.getFullYear ()
      ) -
      actualStartDate.getDate () +
      1;
    daysInCurrentMonth = getNumberOfDaysInAMonth (
      actualStartDate.getMonth (),
      actualStartDate.getFullYear ()
    );
  }
  if (actualEndDate !== endDate) {
    days += actualEndDate.getDate ();
    daysInCurrentMonth = daysInCurrentMonth === 0
      ? getNumberOfDaysInAMonth (
          actualEndDate.getMonth (),
          actualEndDate.getFullYear ()
        )
      : daysInCurrentMonth;
  }
  daysInCurrentMonth = daysInCurrentMonth === 0
    ? getNumberOfDaysInAMonth (
        actualStartDate.getMonth (),
        actualStartDate.getFullYear ()
      )
    : daysInCurrentMonth;
  if (days >= daysInCurrentMonth) {
    days -= daysInCurrentMonth;
    months += 1;
    if (months == 12) {
      years += 1;
      months = 0;
    }
  }
  return `${years} year(s), ${months} month(s) & ${days} day(s)`;
}

function getDifferenceInDays (startDate, endDate) {
  const start = Date.UTC (
    startDate.getFullYear (),
    startDate.getMonth (),
    startDate.getDate ()
  );
  const end = Date.UTC (
    endDate.getFullYear (),
    endDate.getMonth (),
    endDate.getDate ()
  );
  let numberOfDays = Math.ceil ((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return numberOfDays;
}

function getNumberOfDaysInAMonth (month, year) {
  const numberOfDays = {
    0: 31,
    2: 31,
    3: 30,
    4: 31,
    5: 30,
    6: 31,
    7: 31,
    8: 30,
    9: 31,
    10: 30,
    11: 31,
  };
  return month !== 1
    ? numberOfDays[month]
    : (year % 4 == 0 && year % 100 != 0) || year % 400 == 0 ? 29 : 28;
}

function getStartDateAfterRemovingIncompleteMonth (startDate, actualEndDate) {
  if (startDate.getDate () === 1) {
    return startDate;
  } else {
    const newStartDate = new Date (
      startDate.getFullYear (),
      startDate.getMonth () + 1,
      1
    );
    return newStartDate >= actualEndDate ? startDate : newStartDate;
  }
}

function getEndDateAfterRemovingIncompleteMonth (endDate, actualStartDate) {
  let numberOfDaysInMonth = getNumberOfDaysInAMonth (
    endDate.getMonth (),
    endDate.getFullYear ()
  );
  if (endDate.getDate () === numberOfDaysInMonth) {
    return endDate;
  } else {
    let previousMonth = endDate.getMonth () - 1 >= 0
      ? endDate.getMonth () - 1
      : 11;
    let currentYear = endDate.getFullYear ();
    if (previousMonth === 11) {
      currentYear -= 1;
    }
    numberOfDaysInMonth = getNumberOfDaysInAMonth (previousMonth, currentYear);
    const newEndDate = new Date (
      endDate.getFullYear (),
      endDate.getMonth () - 1,
      numberOfDaysInMonth
    );
    return newEndDate <= actualStartDate ? endDate : newEndDate;
  }
}
http
  .createServer (function (req, res) {
    res.writeHead (200, {'Content-Type': 'application/text'});
    var duration = '';
    var body = '';
    req.on ('data', function (data) {
      body += data;
    });
    req.on ('end', function () {
      console.log (typeof body);
      body = JSON.parse (body);
      duration = getDuration (body.startDate, body.endDate, false, false);
      console.log (duration);
      res.write (duration);
      res.end ();
    });
  })
  .listen (3000, function () {
    console.log ('server start at port 3000');
  });
