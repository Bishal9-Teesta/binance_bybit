const bybit_expiry_to_date = contract => {

    const expiry = contract.split("-")[1]

    const y = new Date(expiry).getFullYear()
    const m = new Date(expiry).getMonth() + 1
    const d = new Date(expiry).getDate()

    const expiry_date = new Date(y, m, d, "13", "30", "00")

    return expiry_date
}

export default bybit_expiry_to_date
