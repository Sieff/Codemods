class Driver {
    constructor(_numberOfLateDeliveries) {
        this.numberOfLateDeliveries = _numberOfLateDeliveries;
    }
}

function getRating(drv, drv2) {
    return moreThanFiveLateDeliveries(drv) ? 5 : 1;
}

function getRating2(drv, drv2) {
    return moreThanFiveLateDeliveries(drv2) ? 5 : 1;
}

function moreThanFiveLateDeliveries(aDriver) {
    return aDriver.numberOfLateDeliveries > 5;
}