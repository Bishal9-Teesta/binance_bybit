const bybit_expiry_in_days = contract => {

    const expiry = contract.split("-")[1]

    const y = new Date(expiry).getFullYear()
    const m = new Date(expiry).getMonth() + 1
    const d = new Date(expiry).getDate()

    const expiryDate = new Date(y, m, d, "13", "30", "00")
    const differenceInDays = (expiryDate.getTime() - new Date().getTime()) / ( 1000 * 60 * 60 * 24 )

    return differenceInDays.toFixed(2)
}

export default bybit_expiry_in_days
