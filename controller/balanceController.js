import Balance from "../model/balanceModel.js";
import fs from "fs";
import path from "path";

const filePath = new URL("C:/hpp/my-ikea-test/task-a.sample.json").pathname;
console.log(filePath);

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

export const createCustomerBalance = async (req, res) => {
  try {
    const { retailUnitCode, customerId } = req.params;

    const { time, reason, reasonTime, businessUnit, type, value } = req.body;

    const balance = new Balance(
      time,
      retailUnitCode,
      customerId,
      reason,
      reasonTime,
      businessUnit,
      type,
      value
    );
    // console.log(balance);
    res.status(200).send(`Balance created successfully`);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getCustomerBalance = async (req, res) => {
  try {
    const startMonth = 11;
    const endMonth = 12;
    const { retailUnitCode, customerId, activity, year } = req.params;
    let monthlybalance = {};
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      // -----------------------Calculate monthly closing and opening balance------------------------

      //To do --Improvement
      const allBalanceEvents = JSON.parse(data);
      const filterEventsByCustIdActivityAndMarket = allBalanceEvents.filter(
        (event) => {
          return (
            event.market === retailUnitCode &&
            event.customerId === customerId &&
            event.reason === activity
          );
        }
      );

      const requestYearEventMonthValuePairs = initializeMonthArray();

      const pastBalanceTillRequestYear = calculatePastBalanceTillRequestYear(
        filterEventsByCustIdActivityAndMarket,
        year,
        requestYearEventMonthValuePairs
      );
      console.log(
        "Closing balance for past years:",
        pastBalanceTillRequestYear
      );

      console.log("Request year events:", requestYearEventMonthValuePairs);

      const monthlyClosingBalances = initializeMonthArray();
      const monthlyOpeningBalances = initializeMonthArray();
      monthlyOpeningBalances[0] = pastBalanceTillRequestYear;

      for (let month = 0; month < 12; month++) {
        let monthValue = requestYearEventMonthValuePairs[month];
        if (monthValue === 0 || monthValue == undefined) {
          monthlyClosingBalances[month] = monthlyOpeningBalances[month];
        } else {
          let currentMonthNetValue = monthlyOpeningBalances[month];
          currentMonthNetValue += monthValue;
          monthlyClosingBalances[month] = currentMonthNetValue;
        }
        
        if(month != 11) 
            monthlyOpeningBalances[month + 1] = monthlyClosingBalances[month];
      }
      monthlybalance ={monthlyOpeningBalances,monthlyClosingBalances}
      printBalanceValues(monthlyOpeningBalances, monthlyClosingBalances, year);
    });
    
    res.status(200).send("success");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

function calculatePastBalanceTillRequestYear(
  customerBalanceEvents,
  requestYear,
  requestYearEventMonthValuePairs
) {
  let pastBalanceTillRequestYear = 0;

  customerBalanceEvents.forEach((event) => {
    const eventDate = new Date(event.time);
    const eventYear = eventDate.getFullYear();
    const eventMonth = eventDate.getMonth();
    // Check if event occurred in past years or request year
    if (eventYear < parseInt(requestYear)) {
      console.log(eventYear, "-", event.value);
      pastBalanceTillRequestYear +=
        event.type === "INCREASED" ? event.value : -event.value;
    } else if (eventYear === parseInt(requestYear)) {
      requestYearEventMonthValuePairs[eventMonth] +=
        event.type === "INCREASED" ? event.value : -event.value;
    }
  });

  return pastBalanceTillRequestYear;
}

function initializeMonthArray() {
  const monthlyArray = [];
  for (let month = 0; month < 12; month++) {
    monthlyArray[month] = 0;
  }
  return monthlyArray;
}

function printBalanceValues(monthlyOpeninggBalances, monthlyClosingBalances, requestYear) {
    monthlyOpeninggBalances.forEach((entry, index) => {
    console.log("Opening balance for month:", months[index], requestYear, "is: ", entry);
    console.log("Closing balance for month:", months[index], requestYear, "is: ", monthlyClosingBalances[index]);
  });
}
