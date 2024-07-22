// import {expect} from "@playwright/test";
// import {request} from "@playwright/test";
//
// const postRequest = async (endPoint, payLoad, access_token, idToken) => {
//     const response = await request.post(apiUrl + endPoint, {
//         headers: {
//             Authorization: `Bearer ${access_token}`,
//             Authorization: idToken
//         },
//         data: payLoad
//     });
//
//     expect(response.status()).toBe(200);
//     const responseBody = await response.json();
//     expect(responseBody).not.toBeNull();
// };
//
// const patchRequest = async (endPoint, payLoad, access_token, idToken) => {
//     const response = await request.patch(apiUrl + endPoint, {
//         headers: {
//             Authorization: `Bearer ${access_token}`,
//             "X-Authorization": idToken
//         },
//         data: payLoad
//     });
//
//     expect(response.status()).toBe(200);
//     const responseBody = await response.json();
//     expect(responseBody).not.toBeNull();
// };
//
// const getRequest = async (endPoint, access_token, idToken) => {
//     const response = await request.get(apiUrl + endPoint, {
//         headers: {
//             Authorization: `Bearer ${access_token}`,
//             "X-Authorization": idToken
//         }
//     });
//
//     expect(response.status()).toBe(200);
// };
//
// const putRequest = async (endPoint, payLoad, access_token, idToken) => {
//     const response = await request.put(apiUrl + endPoint, {
//         headers: {
//             Authorization: `Bearer ${access_token}`,
//             "X-Authorization": idToken
//         },
//         data: payLoad
//     });
//
//     expect(response.status()).toBe(200);
// };
//
// const deleteRequest = async (endPoint, access_token, idToken) => {
//     const response = await request.delete(apiUrl + endPoint, {
//         headers: {
//             Authorization: `Bearer ${access_token}`,
//             "X-Authorization": idToken
//         }
//     });
//
//     expect(response.status()).toBe(200);
// };
//
// module.exports = {
//     postRequest,
//     patchRequest,
//     getRequest,
//     putRequest,
//     deleteRequest
// };
