import Balance from "../model/balanceModel.js";
import fs from "fs";
import path from "path";

const filePath = new URL("C:/hpp/my-ikea-test/task-a.sample.json").pathname;
console.log(filePath);

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
    const startMonth = 9;
    const endMonth = 12;
    const { retailUnitCode, customerId, activity, year } = req.params;
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }
       // -----------------------Calculate monthly closing and opening balance------------------------

      try {

        //To do --Improvement
        const balanceEvents = JSON.parse(data);

        const openingBalanceForGivenMonthsAndYears =
          calculateOpeningBalanceForGivenMonthsAndYears(
            balanceEvents,
            startMonth,
            year
          );
        console.log(
          "Closing balance for past months and years:",
          openingBalanceForGivenMonthsAndYears
        );

        const filteredEventsByMonth = balanceEvents.filter((event) => {
          const eventYear = new Date(event.time).getFullYear();
          const eventMonth = new Date(event.time).getMonth() + 1;
          return (
            event.market === retailUnitCode &&
            event.customerId === customerId &&
            event.reason === activity &&
            eventYear == year &&
            eventMonth >= startMonth &&
            eventMonth <= endMonth
          );
        });

        // Calculate opening balance
        let openingBalance = openingBalanceForGivenMonthsAndYears;
        

        // Calculate closing balance
        let closingBalance = 0;

        filteredEvents.forEach((event) => {
          openingBalance +=
            event.type === "INCREASED" ? event.value : -event.value;
          closingBalance +=
            event.type === "INCREASED" ? event.value : -event.value;
        });

        // Log opening and closing balances
        console.log("Opening balance:", openingBalance);
        console.log("Closing balance:", closingBalance);

        // console.log(filteredEvents);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });

    res.status(200).send(filteredEvents);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

function calculateOpeningBalanceForGivenMonthsAndYears(
  balanceEvents,
  startMonth,
  currentYear
) {
  let openingBalance = 0;

  balanceEvents.forEach((event) => {
    const eventDate = new Date(event.time);
    const eventYear = eventDate.getFullYear();
    const eventMonth = eventDate.getMonth() + 1; // Month is zero-based, so add 1

    // Check if event occurred in a past month and year
    if (
      eventYear < parseInt(currentYear) ||
      (eventYear === parseInt(currentYear) && eventMonth < startMonth)
    ) {
      console.log(eventMonth, "-", eventYear, event.value);
      openingBalance += event.type === "INCREASED" ? event.value : -event.value;
    }
  });

  return openingBalance;
}
