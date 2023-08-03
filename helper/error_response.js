const error_response = (endpoint_name, error) => {

    const base_url = error?.config?.baseURL
    const url = error?.config?.url
    const method = error?.config?.method
    const message = error?.response?.data?.msg ? error?.response?.data?.msg : error?.message

    const data_to_log = `
    API Error :-
    API Name:   ${endpoint_name}
    Timestamp:  ${Date.now()} 
    Date:       ${new Date().toLocaleDateString()}
    Time:       ${new Date().toLocaleTimeString()}
    Method:     ${method}
    URI:        ${base_url}${url}
    Message:    ${message}
    `
    console.log(data_to_log)
}

export default error_response
