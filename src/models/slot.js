export class Slot {
    id = ""
    date = Date()
    startTime = Date()
    endTime = Date()
    isBooked = false
    serviceProviderId = ""

    // after booking this slot
    customerId = ""
    status = "open" // open, pending, accepted, rejected
}