/**
 * Perform a Jason webservice call
 * @param {object} params - Query string paramaters
 * @param {string} [URLData=""] - Additional URL data
 * @returns {Promise<object>}
 */
export async function wsCall(params, URLData = "") {
  if (URLData !== "")
    URLData = "&" + URLData;
  const requestData = new URLSearchParams({ 
    ...params,
    pass: "ATH54JK6FG8ES5V6H4JJK85HHAZDFENA" 
  }).toString();
  const queryString = "https://www.vis-express.com/jason2.php?" + requestData + URLData;

  const response = await fetch(queryString);
  if (!response.ok) {
    return { wsError: `Error ${response.status}:${response.statusText}` };
  }

  const result = await response.json().catch((error) => { 
    return { message: error } 
  });
  return result;
}