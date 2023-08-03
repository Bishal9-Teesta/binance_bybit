
import axios from "axios"

const config = () => {

    let bybit_api
    let binance_api
    let bybit_option_socket_base_url
    let bybit_perpetual_socket_base_url
    let bybit_private_socket_base_url
    let application_mode = process.env.APPLICATION_MODE.toString().trim()
    let binance_development_api_key = process.env.DEVELOPMENT_BINANCE_API_KEY.toString().trim()
    let binance_development_secret_key = process.env.DEVELOPMENT_BINANCE_SECRET_KEY.toString().trim()
    let binance_production_api_key = process.env.PRODUCTION_BINANCE_API_KEY.toString().trim()
    let binance_production_secret_key = process.env.PRODUCTION_BINANCE_SECRET_KEY.toString().trim()
    let bybit_development_api_key = process.env.DEVELOPMENT_BYBIT_API_KEY.toString().trim()
    let bybit_development_secret_key = process.env.DEVELOPMENT_BYBIT_SECRET_KEY.toString().trim()
    let bybit_development_socket_perpetual_base_url = "wss://stream-testnet.bybit.com/v5/public/linear"
    let bybit_development_socket_option_base_url = "wss://stream-testnet.bybit.com/v5/public/option"
    let bybit_development_socket_private_base_url = "wss://stream-testnet.bybit.com/v5/private"
    let bybit_production_api_key = process.env.PRODUCTION_BYBIT_API_KEY.toString().trim()
    let bybit_production_secret_key = process.env.PRODUCTION_BYBIT_SECRET_KEY.toString().trim()
    let bybit_production_socket_perpetual_base_url = "wss://stream.bybit.com/v5/public/linear"
    let bybit_production_socket_option_base_url = "wss://stream.bybit.com/v5/public/option"
    let bybit_production_socket_private_base_url = "wss://stream.bybit.com/v5/private"
    
    if (application_mode === "PRODUCTION") {
        bybit_option_socket_base_url = bybit_production_socket_option_base_url
        bybit_perpetual_socket_base_url = bybit_production_socket_perpetual_base_url
        bybit_private_socket_base_url = bybit_production_socket_private_base_url
        bybit_api = axios.create({
            baseURL: "https://api.bybit.com"
        })
        binance_api = axios.create({
            baseURL: "https://eapi.binance.com",
            headers: {
                "X-MBX-APIKEY": binance_production_api_key,
            }
        })
    } else {
        bybit_option_socket_base_url = bybit_development_socket_option_base_url
        bybit_perpetual_socket_base_url = bybit_development_socket_perpetual_base_url
        bybit_private_socket_base_url = bybit_development_socket_private_base_url
        bybit_api = axios.create({
            baseURL: "https://api-testnet.bybit.com"
        })
        binance_api = axios.create({
            baseURL: "https://eapi.binance.com",
            headers: {
                "X-MBX-APIKEY": binance_development_api_key,
            }
        })
    }

    return {
        BYBIT_API: bybit_api,
        BINANCE_API: binance_api,
        BYBIT_SOCKET_PERPETUAL_BASE_URL: bybit_perpetual_socket_base_url,
        BYBIT_SOCKET_OPTION_BASE_URL: bybit_option_socket_base_url,
        BYBIT_SOCKET_PRIVATE_BASE_URL: bybit_private_socket_base_url,
        BINANCE_SOCKET_BASE_URL: "wss://nbstream.binance.com/eoptions",
        binance_development_secret_key,
        binance_production_secret_key,
        bybit_development_secret_key,
        bybit_production_secret_key
    }
}

export default config
