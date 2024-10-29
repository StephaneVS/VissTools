/**
 * Perform a Jason webservice call
 * @param {object} params Query string paramaters
 * @returns {Promise<object>}
 */
export async function wsCall(params) {
  const queryString = "https://www.vis-express.com/jason2.php?" + new URLSearchParams({ 
    ...params,
    pass: "ATH54JK6FG8ES5V6H4JJK85HHAZDFENA" 
  }).toString();
  
  const response = await fetch(queryString);
  if (!response.ok) {
    return { wsError: `Error ${response.status}:${response.statusText}` };
  }

  const result = await response.json();
  return result;
}