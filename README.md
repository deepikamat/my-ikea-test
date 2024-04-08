
# my-ikea-test

This repository holds the API for various customer activities such as Customer balance changes over time, along with the reason for those changes.

## Run Locally
-  Install dependencies
-  cd my-ikea-test
  npm install
 npm start
### Run at server
 https://my-ikea-test-419409.ey.r.appspot.com/api

 #Example 
 https://my-ikea-test-419409.ey.r.appspot.com/api/IT/it.customer-03/PURCHASE/2024/

where
- BASE_URL= https://my-ikea-test-419409.ey.r.appspot.com/api/
- retailUnitCode =IT
- customerId = it.customer-03
- activity = Purchase
- Year= 2024

## Deployment
```
project is deployed through App Engine on GCP server.
- Use gcloud app deploy to deploy into server
```
## Improvements

Added some improvements later on 
- Added relative path for json file.
- modularize the code into small functions.
- Pending unit test cases.