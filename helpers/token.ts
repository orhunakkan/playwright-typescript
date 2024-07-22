// import {expect} from "@playwright/test";
// import {request} from "@playwright/test";
//
// const generateJWTToken = async (apiUrl, idToken) => {
//     const response = await request.post(apiUrl + "/api/usermanagement/Login", {
//         headers: {
//             "Content-Type": "application/json;charset=UTF-8",
//             Authorization: `Bearer ${access_token}`
//         },
//         data: {
//             accessToken: access_token
//         }
//     });
//
//     const login_response = await response.json();
//     console.log(`This is my JWTresponse : ${login_response}`);
//     expect(response.status()).toBe(200);
//     expect(login_response).not.toBeNull();
//     expect(login_response).toHaveProperty("jwtToken");
//     login_response.jwtToken = access_token;
//     return access_token;
// };
//
// const generateAccessToken = async (username, password) => {
//     const response = await request.post(
//         "https://login.microsoftonline.com/3837e71a-63de-4963-8659-768b9abe5b70/oauth2/v2.0/token",
//         {
//             form: true,
//             data: {
//                 grant_type: "password",
//                 client_id: process.env.CLIENT_ID,
//                 client_secret: process.env.CLIENT_SECRET,
//                 scope: process.env.SCOPE,
//                 username: username,
//                 password: password
//             }
//         }
//     );
//
//     const responseBody = await response.json();
//     console.log(`This is my AccessResponse : ${responseBody}`);
//     return responseBody.access_token;
// };
//
// module.exports = { generateJWTToken, generateAccessToken };
