const login = async (page: {
    request: {
        post: (arg0: string, arg1: {
            form?: {
                grant_type: string;
                client_id: string;
                client_secret: string;
                scope: string;
                username: any;
                password: any;
            };
            headers?: { "Content-Type": string; Authorization: string; };
            data?: { accessToken: any; };
        }) => any;
    };
    evaluate: (arg0: {
        ({
             homeAccountId,
             environment,
             tenantId,
             tokenResponse,
             userId,
             name,
             username,
             cachedAt,
             clientId,
             expiresOn,
             extendedExpiresOn,
             iss,
             iat,
             nbf,
             exp,
             aio,
             rh,
             roles,
             sub,
             uti,
             ver,
             id_token
         }: {
            homeAccountId: any;
            environment: any;
            tenantId: any;
            tokenResponse: any;
            userId: any;
            name: any;
            username: any;
            cachedAt: any;
            clientId: any;
            expiresOn: any;
            extendedExpiresOn: any;
            iss: any;
            iat: any;
            nbf: any;
            exp: any;
            aio: any;
            rh: any;
            roles: any;
            sub: any;
            uti: any;
            ver: any;
            id_token: any;
        }): void;
        (requestToken: any): void;
    }, arg1: {
        homeAccountId: string;
        environment: string;
        tenantId: any;
        tokenResponse: any;
        userId: any;
        name: any;
        username: any;
        cachedAt: number;
        clientId: any;
        expiresOn: any;
        extendedExpiresOn: any;
    }) => any;
}, apiUrl: string, Username: any, Password: any) => {
    const response = await page.request.post("https://login.microsoftonline.com/3837e71a-63de-4963-8659-768b9abe5b70/oauth2/v2.0/token", {
            form: {
                grant_type: "password",
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                scope: process.env.SCOPE,
                username: Username,
                password: Password
            }
        }
    );
    const tokenResponse = await response.json();
    const MSALToken = tokenResponse.access_token;
    const cachedAt = Math.round(new Date().getTime() / 1000);
    const expiresOn = cachedAt + tokenResponse.expires_in;
    const extendedExpiresOn = cachedAt + tokenResponse.ext_expires_in;

    const id_token = JSON.parse(Buffer.from(tokenResponse.id_token.split(".")[1], "base64").toString("utf-8"));
    const clientId = id_token.aud;
    const tenantId = id_token.tid;
    const userId = id_token.oid;
    const name = id_token.name;
    const username = id_token.preferred_username;
    const environment = "login.windows.net";
    const homeAccountId = `${userId}.${tenantId}`;

    await page.evaluate(
        ({
             homeAccountId,
             environment,
             tenantId,
             tokenResponse,
             userId,
             name,
             username,
             cachedAt,
             clientId,
             expiresOn,
             extendedExpiresOn,
             iss,
             iat,
             nbf,
             exp,
             aio,
             rh,
             roles,
             sub,
             uti,
             ver,
         }) => {
            localStorage.setItem(
                `${homeAccountId}-${environment}-${tenantId}`,
                JSON.stringify({
                    authorityType: "MSSTS",
                    clientInfo: tokenResponse.client_info,
                    cloudGraphHostName: "",
                    environment,
                    homeAccountId,
                    idTokenClaims: {
                        aud: clientId,
                        iss: iss,
                        iat: iat,
                        nbf: nbf,
                        exp: exp,
                        aio: aio,
                        name: name,
                        oid: userId,
                        preferred_username: username,
                        rh: rh,
                        roles: roles,
                        sub: sub,
                        tid: tenantId,
                        uti: uti,
                        ver: ver
                    },
                    localAccountId: userId,
                    name,
                    realm: tenantId,
                    username
                })
            );

            // Set access token
            localStorage.setItem(
                `${homeAccountId}-${environment}-accesstoken-${clientId}-${tenantId}-${tokenResponse.scope}`,
                JSON.stringify({
                    cachedAt: cachedAt.toString(),
                    clientId,
                    credentialType: "AccessToken",
                    environment,
                    expiresOn: expiresOn.toString(),
                    extendedExpiresOn: extendedExpiresOn.toString(),
                    homeAccountId,
                    realm: tenantId,
                    secret: tokenResponse.access_token,
                    target: tokenResponse.scope,
                    tokenType: "Bearer"
                })
            );

            // Set MSAL Token Keys
            localStorage.setItem(
                `msal.token.keys.${clientId}`,
                JSON.stringify({
                    idToken: {
                        accessToken: {0: tokenResponse.access_token},
                        idToken: {0: tokenResponse.id_token},
                        refreshToken: {0: tokenResponse.refresh_token}
                    }
                })
            );

            // Set ID token
            localStorage.setItem(
                `${homeAccountId}-${environment}-idtoken-${clientId}-${tenantId}-`,
                JSON.stringify({
                    credentialType: {
                        clientId,
                        credentialType: "IdToken",
                        environment,
                        homeAccountId,
                        realm: tenantId,
                        secret: tokenResponse.id_token
                    }
                })
            );

            // Set refresh token
            localStorage.setItem(
                `${homeAccountId}-${environment}-refreshtoken-${clientId}--`,
                JSON.stringify({
                    clientId,
                    credentialType: "RefreshToken",
                    environment,
                    homeAccountId,
                    secret: tokenResponse.refresh_token
                })
            );
        },
        {
            homeAccountId,
            environment,
            tenantId,
            tokenResponse,
            userId,
            name,
            username,
            cachedAt,
            clientId,
            expiresOn,
            extendedExpiresOn
        }
    );

    const requestTokenResponse = await page.request.post(
        apiUrl + "/api/usermanagement/Login",
        {
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                Authorization: `Bearer ${MSALToken}`
            },
            data: {
                accessToken: MSALToken
            }
        }
    );

    const requestToken = await requestTokenResponse.json();

    await page.evaluate((requestToken) => {
        localStorage.setItem("requestToken", requestToken.jwtToken);
        localStorage.setItem("darkTheme", String(requestToken.theme === 1));
        localStorage.setItem("claimBillGridConfig", requestToken.claimBillGridConfig);
        localStorage.setItem("dashboardPageType", "0");
        localStorage.setItem("incidentPin", String(requestToken.incidentPin === false));
        localStorage.setItem("patientPin", String(requestToken.patientPin === true));
        localStorage.setItem("isBatchPrintingResponsable", String(requestToken.isBatchPrintingResponsable === true)
        );
    }, requestToken);
};

module.exports = {login};
