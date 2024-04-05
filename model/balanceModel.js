class Balance {
    constructor(time, market, customerId, reason, reasonTime, businessUnit, type, value) {
    
        (this.time = time),
        (this.market = market),
        (this.customerId = customerId),
        (this.reason = reason),
        (this.reasonTime = reasonTime),
        (this.businessUnit = businessUnit),
        (this.type = type);
        (this.value = value);
    }
  }
  
  export default Balance;