const expiry_in_days = custom_date => {

    const y = new Date(custom_date).getFullYear()
    const m = new Date(custom_date).getMonth()
    const d = new Date(custom_date).getDate()

    const expiryDate = new Date(y, m, d, "13", "30", "00")
    const differenceInDays = (expiryDate.getTime() - new Date().getTime()) / ( 1000 * 60 * 60 * 24 )

    return differenceInDays.toFixed(2)
}

export default expiry_in_days
