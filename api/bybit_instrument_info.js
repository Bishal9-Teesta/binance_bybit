
import config from "../config.js"
import error_response from "../helper/error_response.js"

const bybit_instrument_info = async (next_page_cursor, previous_response) => {

    let response
    if (previous_response) {
        response = previous_response
    }
    let url = `/v5/market/instruments-info?category=option&limit=1000&status=Trading`
    if (next_page_cursor) {
        url = url + '&cursor=' + next_page_cursor
    }

    await config()
        .BYBIT_API
        .get(url)
        .then(async _response => {
            // console.log("Bybit Instrument Info Response: ", JSON.stringify(_response.data, null, 4))
            // console.log(_response.data.result.list.length)
            if (_response.data.result.list.length === 0) {
                // console.log("Stopping")
            } else if (next_page_cursor && previous_response) {
                // console.log("Response Result Length: ", response)
                // response.result.list.push(_response.data.result.list).flat()
                response.result.list = [response.result.list, _response.data.result.list].flat()
                // console.log("Response after addition: ", response.result.list.length)
                response.result.nextPageCursor = _response.data.result.nextPageCursor
                response = await bybit_instrument_info(_response.data.result.nextPageCursor, response)
            } else if (_response.data.result.nextPageCursor !== "") {
                response = _response.data
                response = await bybit_instrument_info(_response.data.result.nextPageCursor, response)
            } else {
                response = _response.data
            }
        })
        .catch(_error => error_response("Bybit Instrument Info", _error))

    return response
}

export default bybit_instrument_info
