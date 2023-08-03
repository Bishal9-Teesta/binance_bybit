const bybit_contract = (underlying, date, strike, type) => {

    const d = ("0" + new Date(date).getDate().toString()).slice(-2)
    const m = new Date(date).toLocaleString('en-IN', { month: "short" }).toUpperCase().slice(0, 3)
    const y = new Date(date).getFullYear().toString().slice(-2)
    const expiry = `${d}${m}${y}`

    return `${underlying}-${expiry}-${strike}-${type}`
}

export default bybit_contract
