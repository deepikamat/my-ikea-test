import Balance from "../model/balanceModel.js";
import fs from "fs";
import { initializeMonthArray } from "./util.js";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Construct the relative path to the JSON file
const relativeFilePath = path.join(__dirname, "../task-a.sample.json");

console.log(__dirname, relativeFilePath);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
    const { retailUnitCode, customerId, activity, year } = req.params;
    fs.readFile(relativeFilePath, "utf8", async (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      //Filter events based on customerId, market and reason of Event

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

      const requestYearEventMonthValuePairs = initializeMonthArray(); // Initialize empty array for 12 months

      //Calculate past year balance which will be opening balance for current year
      const pastBalanceTillRequestYear = calculatePastBalanceTillRequestYear(
        filterEventsByCustIdActivityAndMarket,
        year,
        requestYearEventMonthValuePairs
      );

      //Calculate monthly closing and opening balance for the requested year
      const { monthlyOpeningBalances, monthlyClosingBalances } =
        await calculateBalanceForRequestYear(
          pastBalanceTillRequestYear,
          requestYearEventMonthValuePairs
        );

      printBalanceValues(monthlyOpeningBalances, monthlyClosingBalances, year);
      res.status(200).json({ monthlyOpeningBalances, monthlyClosingBalances });
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const calculatePastBalanceTillRequestYear = (
  customerBalanceEvents,
  requestYear,
  requestYearEventMonthValuePairs
) => {
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
};

const calculateBalanceForRequestYear = async (
  pastBalanceTillRequestYear,
  requestYearEventMonthValuePairs
) => {
  const monthlyClosingBalances = initializeMonthArray();
  const monthlyOpeningBalances = initializeMonthArray();
  monthlyOpeningBalances[0] = pastBalanceTillRequestYear;

  [...Array(12)].forEach((_, month) => {
    let monthValue = requestYearEventMonthValuePairs[month];
    if (monthValue === 0 || monthValue == undefined) {
      monthlyClosingBalances[month] = monthlyOpeningBalances[month];
    } else {
      let currentMonthNetValue = monthlyOpeningBalances[month];
      currentMonthNetValue += monthValue;
      monthlyClosingBalances[month] = currentMonthNetValue;
    }

    if (month != 11)
      monthlyOpeningBalances[month + 1] = monthlyClosingBalances[month];
  });

  return { monthlyOpeningBalances, monthlyClosingBalances };
};

const printBalanceValues = (
  monthlyOpeninggBalances,
  monthlyClosingBalances,
  requestYear
) => {
  monthlyOpeninggBalances.forEach((entry, index) => {
    console.log(
      "Opening balance for month:",
      months[index],
      requestYear,
      "is: ",
      entry
    );
    console.log(
      "Closing balance for month:",
      months[index],
      requestYear,
      "is: ",
      monthlyClosingBalances[index]
    );
  });
};
