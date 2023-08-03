
import config from "../config.js"
import error_response from "../helper/error_response.js"

const binance_orderbook = async option_contract => {

    let response = undefined
    const url = `/eapi/v1/depth?symbol=${option_contract}&limit=1000`
    await config()
        .BINANCE_API
        .get(url)
        .then(_response => {
            // console.log("Binance Orderbook Response: ", _response.data)
            response = _response.data
        })
        .catch(_error => {
            const message = _error?.response?.data?.msg ? _error?.response?.data?.msg : _error?.message
            error_response("Binance Orderbook", message)
        })

    return response
}

export default binance_orderbook
