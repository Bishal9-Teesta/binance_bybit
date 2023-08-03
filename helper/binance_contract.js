const binance_contract = (underlying, date, strike, type) => {

    const y = new Date(date).getFullYear().toString().slice(-2)
    const m = ("0" + (new Date(date).getMonth() + 1).toString()).slice(-2)
    const d = ("0" + new Date(date).getDate().toString()).slice(-2)
    const expiry = `${y}${m}${d}`

    return `${underlying}-${expiry}-${strike}-${type}`
}

export default binance_contract
