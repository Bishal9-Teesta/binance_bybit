
import config from "../config.js"
import error_response from "../helper/error_response.js"

const binance_exchange_info = async () => {

    let response
    let { BINANCE_API } = config()

    await BINANCE_API
        .get('/eapi/v1/exchangeInfo')
        .then(_response => {
            // console.log("Binance Exchange Info: ", _response.data)
            response = _response.data
        })
        .catch(_error => error_response("Binance Exchange Info", _error))

    return response
}

export default binance_exchange_info
